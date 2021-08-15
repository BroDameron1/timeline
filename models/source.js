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
        enum: ['new', 'review', 'active', 'approved', 'published', 'rejected']
    }, 
    author: {
        type: [Schema.Types.ObjectId],
        ref: 'User'
    }
})



const sourceReview = mongoose.model('SourceReview', SourceSchema);
const sourcePublished = mongoose.model('SourcePublished', SourceSchema);

module.exports = {
    sourceReview,
    sourcePublished
}