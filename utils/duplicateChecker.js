const mongoose = require('mongoose');


const submitNew = async (recordProps) => {
    const publicDuplicate = await mongoose.model(recordProps.public).findOne({ 
        ...recordProps.duplicateFields
    }).collation({ locale: 'en', strength: 2 })
    if (publicDuplicate) return publicDuplicate
    const reviewDuplicate = await mongoose.model(recordProps.review).findOne({
        ...recordProps.duplicateFields,
        state: { $in: ['new', 'review'] }
    })
    if (reviewDuplicate) return true
    return false
}

const editReview = async (recordProps) => {
    const reviewData = await mongoose.model(recordProps.review).findById(recordProps.id)
    const publicDuplicate = await mongoose.model(recordProps.public).findOne({ //finds any public records EXCLUDING the related review record.
        ...recordProps.duplicateFields,
        _id: { $ne: reviewData.publicId }
    }).collation({ locale: 'en', strength: 2 })
    if (publicDuplicate) return publicDuplicate
    
    const reviewDuplicate = await mongoose.model(recordProps.review).findOne({
        ...recordProps.duplicateFields,
        _id: { $ne: recordProps.id },
        state: { $in: ['new', 'update'] }
    }).collation({ locale: 'en', strength: 2 })
    if (reviewDuplicate) return true
    return false
}

const publishRecord = async (recordProps, reviewId) => {
    const reviewData = await mongoose.model(recordProps.review).findById(reviewId)
    const publicDuplicate = await mongoose.model(recordProps.public).findOne({ 
        ...recordProps.duplicateFields,
        _id: { $ne: reviewData.publicId }
    }).collation({ locale: 'en', strength: 2 })
    if (publicDuplicate) return publicDuplicate

    const reviewDuplicate = await mongoose.model(recordProps.review).findOne({ 
        ...recordProps.duplicateFields,
        _id: { $ne: reviewId }
        }).collation({ locale: 'en', strength: 2 })
    if (reviewDuplicate) return true
    return false
}

const editPublic = async (recordProps, publicId) => {
    const publicDuplicate = await mongoose.model(recordProps.public).findOne({
        ...recordProps.duplicateFields,
        _id: { $ne: publicId }
    }).collation({ locale: 'en', strength: 2 })
    console.log(publicDuplicate, 'here1')
    if (publicDuplicate) return publicDuplicate
    const reviewDuplicate = await mongoose.model(recordProps.review).findOne({
        ...recordProps.duplicateFields,
        state: { $in: ['new', 'review'] }
    }).collation({ locale: 'en', strength: 2 })
    console.log(reviewDuplicate, 'here2')
    if (reviewDuplicate) return true
    return false
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