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
        enum: ['new', 'update', 'active', 'approved', 'published', 'rejected']
    }, 
    author: {
        type: [Schema.Types.ObjectId],
        ref: 'User'
    }
})



const reviewSource = mongoose.model('ReviewSource', SourceSchema);
const publicSource = mongoose.model('PublicSource', SourceSchema);

module.exports = {
    reviewSource,
    publicSource
}