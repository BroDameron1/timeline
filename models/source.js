const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slugify = require('slugify')

Schema.Types.String.set('trim', true); //sets all strings to trim()

const SourceSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    recordType: {
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
            url: String,
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
    publicId: { //TODO: Changed this to relate to the PublicSource.  Check and make sure nothing broke.
        type: Schema.Types.ObjectId,
        ref: 'PublicSource'
    },
    // publicId: {
    //     type: String
    // },
    updateDate: {
        type: Date,
        get: formatDate
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


SourceSchema.virtual('displayImage').get(function() {
    return this.images.url.replace('/upload', '/upload/w_500,h_500,c_limit')
})

SourceSchema.virtual('duplicateSettings').get(function() {
    const duplicateSettings = {
        fields: {
            title: this.title,
            mediaType: this.mediaType
        },
        // fields: [this.title, this.mediaType],
        // title: this.title,
        // mediaType: this.mediaType,
        review: 'ReviewSource',
        public: 'PublicSource',
        // collections: ['ReviewSource', 'PublicSource'],
        id: this._id
    }
    return duplicateSettings
})

//adds new author to the front of the array of authors, removes any duplicates and stores the last 
//five total authors
//TODO: Don't use this at all.  Replaced by the record handler service.
SourceSchema.methods.updateAuthor = function (previousAuthors, newAuthor) {
    this.author = previousAuthors.filter(previousAuthor => !previousAuthor.equals(newAuthor))
    this.author.unshift(newAuthor)
    if (this.author.length > 5) {
        this.author.splice(5)
    }
}

//sets the date/time for updateDate.  Not sure why we can't use the timestamps.  TODO
SourceSchema.pre('save', function(next) { 
    this.updateDate = Date.now()
    this.slug = slugify(this.title + '_' + this.mediaType, {
        replacement: '_',
        lower: true,
        strict: true
    })
    next()
})

function formatDate (date) { //formats and passes through the last updated time to be displayed.
    const month = date.toLocaleString('default', { month: 'short' });
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    const displayDate = `${month} ${date.getDate()} ${date.getFullYear()} at ${time}`
    return displayDate;
}

function formDate (date) {
    if (date) {
        console.log('test1')
        return date.toISOString().substring(0, 10)
    } else {
        return null
    }
}

function capitalize (stringToCapitalize) {
    return stringToCapitalize.charAt(0).toUpperCase() + stringToCapitalize.slice(1)
}

const reviewSource = mongoose.model('ReviewSource', SourceSchema);
const publicSource = mongoose.model('PublicSource', SourceSchema);

module.exports = {
    reviewSource,
    publicSource
}