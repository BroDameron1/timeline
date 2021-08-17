const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SourceSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
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

SourceSchema.methods.updateAuthor = function (previousAuthors, newAuthor) {
    this.author = previousAuthors.filter(previousAuthor => !previousAuthor.equals(newAuthor))
    this.author.unshift(newAuthor)
    if (this.author.length > 5) {
        this.author.splice(5)
    }
}



const reviewSource = mongoose.model('ReviewSource', SourceSchema);
const publicSource = mongoose.model('PublicSource', SourceSchema);

module.exports = {
    reviewSource,
    publicSource
}