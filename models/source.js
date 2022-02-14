const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { createSlug, imageDelete, formDate, updateDate, displayImage, createReviewMaster } = require('./middleware.js')

Schema.Types.String.set('trim', true); //sets all strings to trim()

const sourceSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    recordType: { //TODO: Find out where used
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
sourceSchema.virtual('recordProps').get(function() {
    const recordProps = {
        duplicateFields: {
            title: this.title || null,
            mediaType: this.mediaType || null,
        },
        review: 'ReviewSource',
        public: 'PublicSource',
        // staticFields: ['mediaType'],
        staticFields: {
            mediaType: mongoose.model('ReviewSource').schema.path('mediaType').enumValues
        },
        id: this._id,
        reviewUrl: `/sources/review/${this._id}`
    }
    return recordProps
})

//virtual property that updates the path/URL of the image request to cloudinary with a request for a specific size of the image.
sourceSchema.virtual('displayImage').get(displayImage)

//virtual property that uses the timestamp field to construct a readable update date
sourceSchema.virtual('updateDate').get(updateDate)

//creates a master review record
sourceSchema.pre('save', createReviewMaster)

//middleware that creates and adds the slug to the document before saving.
sourceSchema.pre('save', createSlug)

//middleware that removes any unnecessary images if a document is deleted TODO: search multiple collections at once
sourceSchema.post('remove', {document: true, query: false}, imageDelete)



const reviewSource = mongoose.model('ReviewSource', sourceSchema);
const publicSource = mongoose.model('PublicSource', sourceSchema);

module.exports = {
    reviewSource,
    publicSource
}