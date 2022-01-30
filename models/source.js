const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slugify = require('slugify'); //pull in slugify library to help create URL slugs
const { cloudinary } = require('../utils/cloudinary');

Schema.Types.String.set('trim', true); //sets all strings to trim()

const SourceSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    recordType: { //TODO: Where are we checking this
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

//virtual property that updates the path/URL of the image request to cloudinary with a request for a specific size of the image.
SourceSchema.virtual('displayImage').get(function() {
    return this.images.path.replace('/upload', '/upload/w_500,h_500,c_limit')
})

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

SourceSchema.virtual('updateDate').get(function() {
    const date = this.updatedAt
    const month = date.toLocaleString('default', { month: 'short' });
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    const displayDate = `${month} ${date.getDate()}, ${date.getFullYear()} at ${time}`
    return displayDate;
})

//pre-save middleware that sets the updateDate timestamp and creates a slug of the record title.
SourceSchema.pre('save', function(next) { 
    this.slug = slugify(this.title + '_' + this.mediaType, {
        replacement: '_',
        lower: true,
        strict: true
    })
    next()
})

// SourceSchema.post('findOneAndDelete', async function(doc, next) {
//     console.log(doc)
//     // const publicData = await mongoose.model(doc.recordProps.public).findOne({ images: { filename: doc.images.filename } })
//     const publicData = await mongoose.model(doc.recordProps.public).findOne({ comic: { series: 'Doctor Aphra' } })
//     const publicData2 = await mongoose.model(doc.recordProps.public).findOne({ images: { filename: 'butt' }})
//     console.log(publicData, 'first check')
//     console.log(publicData2, 'second check')
//     next()
// })

SourceSchema.post('remove', { document: true, query: false }, async function(doc, next) { //keep testing and then delete old code
    if (doc.images) {
        const publicData = await mongoose.model(this.recordProps.public).findOne({'images.filename': this.images.filename })
        console.log(publicData, 'public')
        const reviewData = await mongoose.model(this.recordProps.review).findOne({'images.filename': this.images.filename })
        console.log(reviewData, 'review')
        if (!publicData && !reviewData) {
            await cloudinary.uploader.destroy(this.images.filename)
        }
    }
    next()
    // console.log(doc)
    // console.log(doc.recordProps)
    // console.log(this.images.filename, 'filename')
    // if (doc.images) {
    //     const publicData = await mongoose.model(doc.recordProps.public).findOne({ images: { filename: doc.images.filename }})
    //     console.log(publicData, 'public')
    //     try {
    //     const reviewData = await mongoose.model(doc.recordProps.review).findOne({ images: { filename: doc.images.filename }})

    //     console.log(doc.images.filename, reviewData, 'review')
    //     if (!publicData && !reviewData) await cloudinary.uploader.destroy(doc.images.filename)
    // } catch (err) {
    //     console.log(err, 'error?')
    // }
    // }

    // if (doc) {
    //     const test = await mongoose.model(this.recordProps.review).findOne({ title: 'test1' })
    //     console.log(test, 'test')
    //     const publicData = await mongoose.model(this.recordProps.public).findOne({ images: { filename: this.images.filename }})
    //     console.log(publicData, 'public')
    //     const reviewData = await mongoose.model(this.recordProps.review).findOne({ images: { filename: this.images.filename }})

    //     console.log(reviewData, 'review')
    //     if (!publicData && !reviewData) await cloudinary.uploader.destroy(doc.images.filename)
    // }

})

//function to take the date as it exists in the database and format it so that it fits into the date selector field on the form. 
function formDate (date) {
    if (date) return date.toISOString().substring(0, 10) //needs to check if the date exist since undefined can't be changed.  Turns date into a string and cuts it to the 0-10th character.
}

//TODO: image deletion middleware instead of functions?

const reviewSource = mongoose.model('ReviewSource', SourceSchema);
const publicSource = mongoose.model('PublicSource', SourceSchema);

module.exports = {
    reviewSource,
    publicSource
}