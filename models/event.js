const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { createSlug, imageDelete, formDate, updateDate, displayImage, createReviewMaster } = require('./middleware.js')

Schema.Types.String.set('trim', true); //sets all strings to trim()

const eventSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    recordType: {
        type: String,
        default: 'Event',
        required: true,
        immutable: true
    },
    slug: {
        type: String
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
        ref: 'PublicEvent'
    },
    adminNotes: { 
        type: String
    },
    eventDate: {
        year: {
            type: Number
        },
        notation: {
            type: String,
            required: true,
            enum: ['BBY', 'BBY/ABY', 'ABY']
        },
        day: {
            type: Number
        }
    }
},
    { timestamps: true })

//virtual property that stores specific properties of the record so that they can be called in functions that need to work with every record type (duplicatechecker, record-handler-service, etc...)
eventSchema.virtual('recordProps').get(function() {
    const recordProps = {
        duplicateFields: {
            title: this.title || null,
        },
        review: 'ReviewEvent',
        public: 'PublicEvent',
        id: this._id,
        reviewUrl: `/events/review/${this._id}`,
        staticFields:
            {
                eventDate: {
                    notation: mongoose.model('ReviewEvent').schema.path('eventDate.notation').enumValues
                }
            }
    }
    return recordProps
})

//virtual property that updates the path/URL of the image request to cloudinary with a request for a specific size of the image.
eventSchema.virtual('displayImage').get(displayImage)

//virtual property that uses the timestamp field to construct a readable update date
eventSchema.virtual('updateDate').get(updateDate)

//middleware that creates and adds the slug to the document before saving.
eventSchema.pre('save', createSlug)

//creates a master review record
eventSchema.pre('save', createReviewMaster)

//middleware that removes any unnecessary images if a document is deleted
eventSchema.post('remove', {document: true, query: false}, imageDelete)

const reviewEvent = mongoose.model('ReviewEvent', eventSchema);
const publicEvent = mongoose.model('PublicEvent', eventSchema);

module.exports = {
    reviewEvent,
    publicEvent
}