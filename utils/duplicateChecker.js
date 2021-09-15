const Source = require('../models/source');
const mongoose = require('mongoose');
const ExpressError = require('../utils/expressError');


const submitNew = async (title, mediaType) => {
    const publicDuplicate = await Source.publicSource.findOne({ 
        title, 
        mediaType 
    }).collation({ locale: 'en', strength: 2 })
    if (publicDuplicate) return publicDuplicate
    const reviewDuplicate = await Source.reviewSource.findOne({ 
        title, 
        mediaType 
    }).collation({ locale: 'en', strength: 2 })
    if (reviewDuplicate) return true
    return false
}

const updateReview = async (title, mediaType, sourceId) => {
    let publicDuplicate
    //i'm good, returns ANY review records that match title and mediatype but NOT the same _id
    const reviewDuplicate = await Source.reviewSource.findOne({
        title,
        mediaType,
        _id: { $ne: sourceId }
    }).collation({ locale: 'en', strength: 2 })

    const reviewSourceData = await Source.reviewSource.findById(sourceId)
    if (reviewSourceData.publicId) {
        publicDuplicate = await Source.publicSource.findOne({ //finds any public records EXCLUDING the related review record.
                title, 
                mediaType, 
                _id: { $ne: reviewSourceData.publicId }
            }).collation({ locale: 'en', strength: 2 })
    } else {
        publicDuplicate = await Source.publicSource.findOne({ 
            title, 
            mediaType
        }).collation({ locale: 'en', strength: 2 })
    }
    if (publicDuplicate) return publicDuplicate
    if (reviewDuplicate) return true
    return false
}

const publishRecord = async (title, mediaType, sourceId) => {
    const reviewSourceData = await Source.reviewSource.findById(sourceId)
    const publicDuplicate = await Source.publicSource.findOne({ 
        title, 
        mediaType, 
        _id: { $ne: reviewSourceData.publicId }
    }).collation({ locale: 'en', strength: 2 })
    if (publicDuplicate) return publicDuplicate
    return false
}

//sourceId here is the PUBLIC SOURCE ID for the article being edited.
const editPublic = async (title, mediaType, sourceId) => {
    const publicDuplicate = await Source.publicSource.findOne({
        title,
        mediaType,
        _id: { $ne: sourceId}
    }).collation({ locale: 'en', strength: 2 })
    const reviewDuplicate = await Source.publicSource.findOne({
        title,
        mediaType,
        state: { $in: ['new', 'review'] }
    }).collation({ locale: 'en', strength: 2 })
    if (publicDuplicate) return publicDuplicate
    if (reviewDuplicate) return true
    return false
}

module.exports = {
    submitNew,
    updateReview,
    publishRecord,
    editPublic
}