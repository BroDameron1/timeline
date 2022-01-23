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

//TODO: Can we reduce redundant code here?
//duplicate check for records being published from the review db to the public db
const publishRecord = async (recordProps, reviewId) => { //TODO check if I need the review ID or if it is already the recordProps.id
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



// const submitNew = async (title, mediaType) => {
//     const publicDuplicate = await Source.publicSource.findOne({ 
//         title, 
//         mediaType 
//     }).collation({ locale: 'en', strength: 2 })
//     if (publicDuplicate) return publicDuplicate
//     const reviewDuplicate = await Source.reviewSource.findOne({ 
//         title, 
//         mediaType 
//     }).collation({ locale: 'en', strength: 2 })
//     if (reviewDuplicate) return true
//     return false
// }


// const updateReview = async (title, mediaType, sourceId) => {
//     let publicDuplicate
//     //i'm good, returns ANY review records that match title and mediatype but NOT the same _id
//     const reviewDuplicate = await Source.reviewSource.findOne({
//         title,
//         mediaType,
//         _id: { $ne: sourceId },
//         state: { $in: ['new', 'review'] }
//     }).collation({ locale: 'en', strength: 2 })
//     const reviewSourceData = await Source.reviewSource.findById(sourceId)
//     if (reviewSourceData.publicId) {
//         publicDuplicate = await Source.publicSource.findOne({ //finds any public records EXCLUDING the related review record.
//                 title, 
//                 mediaType, 
//                 _id: { $ne: reviewSourceData.publicId }
//             }).collation({ locale: 'en', strength: 2 })
//     } else {
//         publicDuplicate = await Source.publicSource.findOne({ 
//             title, 
//             mediaType
//         }).collation({ locale: 'en', strength: 2 })
//     }
//     if (publicDuplicate) return publicDuplicate
//     if (reviewDuplicate) return true
//     return false
// }

// const publishRecord = async (title, mediaType, sourceId) => {
//     const reviewSourceData = await Source.reviewSource.findById(sourceId)
//     const publicDuplicate = await Source.publicSource.findOne({ 
//         title, 
//         mediaType, 
//         _id: { $ne: reviewSourceData.publicId }
//     }).collation({ locale: 'en', strength: 2 })
//     if (publicDuplicate) return publicDuplicate
//     return false
// }

//sourceId here is the PUBLIC SOURCE ID for the article being edited.
// const editPublic = async (title, mediaType, sourceId) => {
//     const publicDuplicate = await Source.publicSource.findOne({
//         title,
//         mediaType,
//         _id: { $ne: sourceId}
//     }).collation({ locale: 'en', strength: 2 })
//     const reviewDuplicate = await Source.publicSource.findOne({
//         title,
//         mediaType,
//         state: { $in: ['new', 'review'] }
//     }).collation({ locale: 'en', strength: 2 })
//     if (publicDuplicate) return publicDuplicate
//     if (reviewDuplicate) return true
//     return false
// }