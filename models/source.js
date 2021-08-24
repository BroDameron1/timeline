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
        enum: ['new', 'update', 'checked out', 'approved', 'published', 'rejected']
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

//Validation if a newly submitted record already exists by matching title AND mediaType in both
//review and public collections.
SourceSchema.statics.checkDuplicates = async function (title, mediaType) {
    //TODO: Account for capitalization
    if (!title || !mediaType) throw new ExpressError('Invalid Entry')
    const publicDuplicate = await mongoose.models.PublicSource.findOne({ title, mediaType })
    if (!publicDuplicate) {
        const reviewDuplicate = await mongoose.models.ReviewSource.findOne({ title, mediaType })
        console.log(reviewDuplicate)
        if (!reviewDuplicate) return false
        return true
    }
    return publicDuplicate;
}


const reviewSource = mongoose.model('ReviewSource', SourceSchema);
const publicSource = mongoose.model('PublicSource', SourceSchema);

module.exports = {
    reviewSource,
    publicSource
}
