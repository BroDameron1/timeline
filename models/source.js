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
        enum: ['new', 'review', 'active', 'rejected']
    }, 
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})



const sourceReview = mongoose.model('SourceReview', SourceSchema);
const sourceFinal = mongoose.model('Source', SourceSchema);

module.exports = {
    sourceReview,
    sourceFinal
}