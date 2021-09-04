const mongoose = require('mongoose');
const ExpressError = require('../utils/expressError');
const Schema = mongoose.Schema;

const SourceSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    mediaType: {
        type: String,
        required: true,
        enum: ['Movie', 'TV Show', 'Book', 'Comic', 'Video Game']
    },
    state: {
        type: String,
        required: true,
        enum: ['new', 'update', 'approved', 'published', 'rejected']
    },
    checkedOut: {
        type: Boolean,
        required: true,
        default: false
    },
    author: {
        type: [ Schema.Types.ObjectId ],
        ref: 'User'
    },
    publicId: {
        type: String
    }
});

//adds new author to the front of the array of authors, removes any duplicates and stores the last 
//five total authors
SourceSchema.methods.updateAuthor = function (previousAuthors, newAuthor) {
    this.author = previousAuthors.filter(previousAuthor => !previousAuthor.equals(newAuthor))
    this.author.unshift(newAuthor)
    if (this.author.length > 5) {
        this.author.splice(5)
    }
}

//Validation if a newly submitted record already exists by matching title, mediaType, and Review ID 
//in both review and public collections.  Returns true if a record exists and returns the record
//if in the public collection.  Returns true if in the review collection.  Returns false if no record
//exists.
SourceSchema.statics.checkDuplicates = async function (title, mediaType, sourceId = null) {
    //TODO: Account for capitalization
    console.log(sourceId, 'test0')
    if (!title || !mediaType) throw new ExpressError('Invalid Entry')
    //const publicDuplicate = await mongoose.models.PublicSource.findOne({ title, mediaType })
    const publicDuplicate = await this.checkPublicDuplicates(title, mediaType, sourceId)
    console.log(publicDuplicate, 'testnext')
    if (!publicDuplicate || publicDuplicate._id.equals(sourceId)) {
        console.log('test2')
        // const reviewDuplicate = await mongoose.models.ReviewSource.findOne({ title, mediaType })
        let reviewDuplicate
        console.log(sourceId, 'here0')
        if (!mongoose.Types.ObjectId.isValid(sourceId)) {
            console.log('here1')
            reviewDuplicate = await mongoose.models.ReviewSource.findOne({ 
                title, 
                mediaType,
                state: { $in: ['new', 'review'] }
            })
        } else {
            console.log(sourceId, 'here2')
            reviewDuplicate = await mongoose.models.ReviewSource.findOne({ 
                _id: { $ne: sourceId },
                title, 
                mediaType,
                state: { $in: ['new', 'review'] }
            })
        }
        console.log(reviewDuplicate, 'test1')
        if (!reviewDuplicate) {
            return false
        } else {
            return true
        }
        // if (!reviewDuplicate) return false
        // //this ensures the record doesn't find itself in the review collection by checking the review ID.
        // console.log(reviewDuplicate._id.equals(sourceId), 'test2')
        // if (!reviewDuplicate._id.equals(sourceId) && (reviewDuplicate.state === 'new' || reviewDuplicate.state === 'update')) {
        //     return true
        // } else {
        //     return false
        // }
    }
    return publicDuplicate;
}

//Validation if a submitted record already exists in the public collection by matching title and
//mediaType.  Returns the record if it exists, returns false if it doesn't.
SourceSchema.statics.checkPublicDuplicates = async function (title, mediaType, sourceId = null) {
    if (!title || !mediaType) throw new ExpressError('Invalid Entry')
    console.log(sourceId, 'test5')
    let publicDuplicate
    console.log(mongoose.Types.ObjectId.isValid(sourceId))
    if (!mongoose.Types.ObjectId.isValid(sourceId)) {
        publicDuplicate = await mongoose.models.PublicSource.findOne({ 
            title, 
            mediaType, 
        })
    } else {
        const reviewSourceData = await mongoose.models.ReviewSource.findById(sourceId)
        console.log(reviewSourceData)
        publicDuplicate = await mongoose.models.PublicSource.findOne({ 
            title, 
            mediaType, 
            _id: { $ne: reviewSourceData.publicId }
        })
        console.log(publicDuplicate, 'test9')
    }
    //console.log(reviewSourceData.publicId, 'test6')
    // publicDuplicate = await mongoose.models.PublicSource.findOne({ title, mediaType, _id: { $ne: reviewSourceData.publicId }} )
    //const publicDuplicate = await mongoose.models.PublicSource.findOne({ title, mediaType })
    console.log(publicDuplicate, 'test7')
    if (!publicDuplicate) return false
    return publicDuplicate
}


const reviewSource = mongoose.model('ReviewSource', SourceSchema);
const publicSource = mongoose.model('PublicSource', SourceSchema);

module.exports = {
    reviewSource,
    publicSource
}
