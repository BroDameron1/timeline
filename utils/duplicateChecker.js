const Source = require('../models/source');
const mongoose = require('mongoose');
const ExpressError = require('../utils/expressError');

const submitNew = async (title, mediaType) => {
    const publicDuplicate = await Source.publicSource.findOne({ title, mediaType })
    if (publicDuplicate) return publicDuplicate
    const reviewDuplicate = await Source.reviewSource.findOne({ title, mediaType })
    if (reviewDuplicate) return true
    return false
}

const updateReview = async (title, mediaType, sourceId) => {
    console.log('here')
    let publicDuplicate
    //i'm good, returns ANY review records that match title and mediatype but NOT the same _id
    const reviewDuplicate = await Source.reviewSource.findOne({
        title,
        mediaType,
        _id: { $ne: sourceId }
    })

    const reviewSourceData = await Source.reviewSource.findById(sourceId)
    if (reviewSourceData.publicId) {
        publicDuplicate = await mongoose.models.PublicSource.findOne({ //finds any public records EXCLUDING the related review record.
                title, 
                mediaType, 
                _id: { $ne: reviewDuplicate.publicId }
            })
    } else {
        publicDuplicate = await mongoose.models.PublicSource.findOne({ //finds any public records EXCLUDING the related review record.
            title, 
            mediaType
        })
    }
    if (publicDuplicate) return publicDuplicate
    if (reviewDuplicate) return true
    return false
}

module.exports = {
    submitNew,
    updateReview
}


//(!mongoose.Types.ObjectId.isValid(sourceId)


// if (!mongoose.Types.ObjectId.isValid(sourceId)) { //determines if source Id exists or is null
//     publicDuplicate = await Source.publicSource.findOne({ title, mediaType }) //finds any publics records if sourceId doesn't exist
// } else {
//     reviewDuplicate = await Source.reviewSource.findById(sourceId) //finds review records if source Id exists
// }