const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slugify = require('slugify'); //pull in slugify library to help create URL slugs
const { cloudinary } = require('../utils/cloudinary');
const { createSlug, imageDelete, formDate, updateDate, displayImage } = require('./middleware.js')

Schema.Types.String.set('trim', true); //sets all strings to trim()

const SourceSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    recordType: { //currently not used any where but may be useful in the future
        type: String,
        default: 'Source',
        required: true,
        immutable: true
    },
    slug: {
        type: String,
    },
    mediaType: {
        type: String,
        required: true,
        immutable: true,
        enum: ['Movie', 'TV Show', 'Book', 'Comic', 'Video Game']
    },
    images: {
            path: String,
            filename: String,
        },
    state: {
        type: String,
        required: true,
        enum: ['new', 'update', 'approved', 'published', 'rejected'],
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
    lastApprover: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    publicId: { 
        type: Schema.Types.ObjectId,
        ref: 'PublicSource'
    },
    adminNotes: { 
        type: String
    },
    book: {
        author: {
            type: [ String ],
            default: undefined
        },
        publisher: String,
        series: String,
        releaseDate: {
            type: Date,
            get: formDate
        },
        isbn10: String
    },
    movie: {
        director: {
            type: [ String ],
            default: undefined
        },
        writer: {
            type: [ String ],
            default: undefined
        },
        releaseDate: {
            type: Date,
            get: formDate
        }
    },
    comic: {
        writer: String,
        artist: {
            type: [ String ],
            default: undefined
        },
        series: String,
        issueNum: Number,
        releaseDate: {
            type: Date,
            get: formDate
        }
    },
    tv: {
        series: String,
        season: Number,
        episode: Number,
        releaseDate: {
            type: Date,
            get: formDate
        }
    },
    videoGame: {
        studio: String,
        publisher: String,
        releaseDate: {
            type: Date,
            get: formDate
        }
    }
},
    { timestamps: true });

//virtual property that stores specific properties of the record so that they can be called in functions that need to work with every record type (duplicatechecker, record-handler-service, etc...)
SourceSchema.virtual('recordProps').get(function() {
    const recordProps = {
        duplicateFields: {
            title: this.title || null,
            mediaType: this.mediaType || null,
        },
        review: 'ReviewSource',
        public: 'PublicSource',
        staticFields: ['mediaType'],
        id: this._id
    }
    return recordProps
})

//virtual property that updates the path/URL of the image request to cloudinary with a request for a specific size of the image.
SourceSchema.virtual('displayImage').get(displayImage)

SourceSchema.virtual('updateDate').get(updateDate)

SourceSchema.pre('save', createSlug)

SourceSchema.post('remove', {document: true, query: false}, imageDelete)

const reviewSource = mongoose.model('ReviewSource', SourceSchema);
const publicSource = mongoose.model('PublicSource', SourceSchema);

module.exports = {
    reviewSource,
    publicSource
}