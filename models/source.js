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
    if (!title || !mediaType) throw new ExpressError('Invalid Entry')
    const publicDuplicate = await mongoose.models.PublicSource.findOne({ title, mediaType })
    if (!publicDuplicate) {
        const reviewDuplicate = await mongoose.models.ReviewSource.findOne({ title, mediaType })
        if (!reviewDuplicate) return false
        //this ensures the record doesn't find itself in the review collection by checking the review ID.
        if (reviewDuplicate && !reviewDuplicate._id.equals(sourceId)) {
            return true
        } else {
            return false
        }
    }
    return publicDuplicate;
}

//Validation if a submitted record already exists in the public collection by matching title and
//mediaType.  Returns the record if it exists, returns false if it doesn't.
SourceSchema.statics.checkPublicDuplicates = async function (title, mediaType) {
    if (!title || !mediaType) throw new ExpressError('Invalid Entry')
    const publicDuplicate = await mongoose.models.PublicSource.findOne({ title, mediaType })
    if (!publicDuplicate) return false
    return publicDuplicate
}


const reviewSource = mongoose.model('ReviewSource', SourceSchema);
const publicSource = mongoose.model('PublicSource', SourceSchema);

module.exports = {
    reviewSource,
    publicSource
}
