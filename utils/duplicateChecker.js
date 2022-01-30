const mongoose = require('mongoose');

//utility for checking for duplicates whenever a change to a record is submitted.  Different types of submissions require checking in different spots.
//every function takes in recordProps the collections to check against and the duplicate fields to check and the mongo ID of the record that the duplicate check is being sent from
//all checks are done with a strength level of 2 - Collation performs comparisons up to secondary differences, such as diacritics. That is, collation performs comparisons of base characters (primary differences) and diacritics (secondary differences). Differences between base characters takes precedence over secondary differences.

//duplicate check for newly submitted records.
const submitNew = async (recordProps) => {
    const publicDuplicate = await mongoose.model(recordProps.public).findOne({ 
        ...recordProps.duplicateFields
    }).collation({ locale: 'en', strength: 2 }) //returns the first record in the public db that matches the duplicate fields
    if (publicDuplicate) return publicDuplicate //if a record is found, returns that record and stops any further search
    const reviewDuplicate = await mongoose.model(recordProps.review).findOne({ 
        ...recordProps.duplicateFields,
        state: { $in: ['new', 'review'] } //only returns records that are in the state of new or review.  approved or rejected records are irrevelant.
    }).collation({ locale: 'en', strength: 2 }) //returns the first record in the review db that matches the duplicate fields.
    if (reviewDuplicate) return true //if a record is found it would only be accessible to the author and admins so the only value returned is true
    return false //returns false if no duplicate is found
}

//duplicate check for when an author updates their pending review record.
const editReview = async (recordProps) => {
    const reviewData = await mongoose.model(recordProps.review).findById(recordProps.id) //uses the id to find ALL data related to the record be checked.
    const publicDuplicate = await mongoose.model(recordProps.public).findOne({ 
        ...recordProps.duplicateFields,
        _id: { $ne: reviewData.publicId } //excludes the public version of the review record (if one exists) since it is not a duplicate
    }).collation({ locale: 'en', strength: 2 }) //returns the first record in the public db that matches the duplicate fields (except the related public record)
    if (publicDuplicate) return publicDuplicate //if a record is found, returns that record and stops any further search
    
    const reviewDuplicate = await mongoose.model(recordProps.review).findOne({
        ...recordProps.duplicateFields,
        _id: { $ne: recordProps.id }, //the record excludes itself from the search
        state: { $in: ['new', 'update'] } //only returns records that are in the state of new or review.  approved or rejected records are irrevelant.
    }).collation({ locale: 'en', strength: 2 }) //returns the first record in the review db that matches the duplicate fields.
    if (reviewDuplicate) return true //if a record is found it would only be accessible to the author and admins so the only value returned is true
    return false //returns false if no duplicate is found
}

//duplicate check for records being published from the review db to the public db
const publishRecord = async (recordProps, reviewId) => { 
    const reviewData = await mongoose.model(recordProps.review).findById(reviewId) //uses the id to find ALL data related to the record be checked.
    const publicDuplicate = await mongoose.model(recordProps.public).findOne({ 
        ...recordProps.duplicateFields,
        _id: { $ne: reviewData.publicId } //excludes the public version of the review record (if one exists) since it is not a duplicate
    }).collation({ locale: 'en', strength: 2 }) //returns the first record in the public db that matches the duplicate fields (except the related public record)
    if (publicDuplicate) return publicDuplicate //if a record is found, returns that record and stops any further search

    const reviewDuplicate = await mongoose.model(recordProps.review).findOne({ 
        ...recordProps.duplicateFields,
        _id: { $ne: reviewId }, //the record excludes itself from the search
        state: { $in: ['new', 'review'] } //only returns records that are in the state of new or review.  approved or rejected records are irrevelant.
        }).collation({ locale: 'en', strength: 2 }) //returns the first record in the review db that matches the duplicate fields.
    if (reviewDuplicate) return true //if a record is found it would only be accessible to the author and admins so the only value returned is true
    return false //returns false if no duplicate is found
}

//duplicate check for when a user is submitting an edit to an existing public record
const editPublic = async (recordProps, publicId) => {
    const publicDuplicate = await mongoose.model(recordProps.public).findOne({
        ...recordProps.duplicateFields,
        _id: { $ne: publicId } //excludes itself.  This is different than the recordProps.id since that is the ID for the review form being filled out.
    }).collation({ locale: 'en', strength: 2 }) //returns the first record in the public db that matches the duplicate fields (except the related public record)
    if (publicDuplicate) return publicDuplicate //if a record is found, returns that record and stops any further search
    const reviewDuplicate = await mongoose.model(recordProps.review).findOne({
        ...recordProps.duplicateFields,
        state: { $in: ['new', 'review'] } //only returns records that are in the state of new or review.  approved or rejected records are irrevelant. Doesn't need to exclude itself since it doesn't exist yet, but include the criteria probably wouldn't break it.
    }).collation({ locale: 'en', strength: 2 }) //returns the first record in the review db that matches the duplicate fields.
    if (reviewDuplicate) return true //if a record is found it would only be accessible to the author and admins so the only value returned is true
    return false //returns false if no duplicate is found
}

module.exports = {
    submitNew,
    editReview,
    publishRecord,
    editPublic
}
