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
        immutable: true,
        enum: ['Movie', 'TV Show', 'Book', 'Comic', 'Video Game']
    },
    images: {
            url: String,
            filename: String,
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
    },
    updateDate: {
        type: Date,
        get: formatDate
    },
    book: {
        author: {
            type: [ String ],
            required: true
        },
        publisher: {
            type: String,
        }
    }
},
    { timestamps: true, get: formatDate  });

//adds new author to the front of the array of authors, removes any duplicates and stores the last 
//five total authors
SourceSchema.methods.updateAuthor = function (previousAuthors, newAuthor) {
    this.author = previousAuthors.filter(previousAuthor => !previousAuthor.equals(newAuthor))
    this.author.unshift(newAuthor)
    if (this.author.length > 5) {
        this.author.splice(5)
    }
}

SourceSchema.pre('save', function(next) {
    this.updateDate = Date.now()
    next()
})

function formatDate (date) {
    const month = date.toLocaleString('default', { month: 'short' });
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    const displayDate = `${month} ${date.getDate()} ${date.getFullYear()} at ${time}`
    return displayDate;
}


const reviewSource = mongoose.model('ReviewSource', SourceSchema);
const publicSource = mongoose.model('PublicSource', SourceSchema);

module.exports = {
    reviewSource,
    publicSource
}
