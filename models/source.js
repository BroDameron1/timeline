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
        enum: ['new', 'update', 'checked out-r', 'checked out-p', 'approved', 'published', 'rejected']
    }, 
    author: {
        type: [ Schema.Types.ObjectId ],
        ref: 'User'
    },
    publicId: {
        type: String
    }
});

SourceSchema.methods.updateAuthor = function (previousAuthors, newAuthor) {
    this.author = previousAuthors.filter(previousAuthor => !previousAuthor.equals(newAuthor))
    this.author.unshift(newAuthor)
    if (this.author.length > 5) {
        this.author.splice(5)
    }
}


// SourceSchema.pre('save', async function(next) {
//     const publicSourceData = await mongoose.models.PublicSource.findOne({ title: this.title })
//     console.log(publicSourceData)
//     if (!publicSourceData) {
//         return next();
//     }
//     if (publicSourceData.title === this.title && publicSourceData.mediaType === this.mediaType) {
//         throw new ExpressError('A record for this source already exists', 418)
//     }
// })

const reviewSource = mongoose.model('ReviewSource', SourceSchema);
const publicSource = mongoose.model('PublicSource', SourceSchema);

module.exports = {
    reviewSource,
    publicSource
}
