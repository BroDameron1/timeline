const slugify = require('slugify'); //pull in slugify library to help create URL slugs
const mongoose = require('mongoose');
const ReviewMaster = require('../models/review')
const { cloudinary } = require('../utils/cloudinary');


function createSlug(next) {
    this.slug = slugify(this.title + '_' + (this.mediaType ? this.mediaType : '') + '_' + this.recordType, {
        replacement: '_',
        lower: true,
        strict: true
    })
    next()
}

async function createReviewMaster(next) {
    if (this.isNew && (this.state === 'new' || this.state === 'update')) {
        const reviewData = new ReviewMaster()
        reviewData.reviewRecord = this._id
        reviewData.onModel = this.recordProps.review
        await reviewData.save()
    }
    next()
}

async function imageDelete(doc, next) {  
    if (doc.images) { //TODO: Changed this from doc.images.filename to doc.images.  Check if works still
        const publicData = await mongoose.model(this.recordProps.public).findOne({'images.filename': this.images.filename })
        const reviewData = await mongoose.model(this.recordProps.review).findOne({'images.filename': this.images.filename })
        if (!publicData && !reviewData) {
            await cloudinary.uploader.destroy(this.images.filename)
        }
    }
    next()
}

function formDate(date) {
    if (date) return date.toISOString().substring(0, 10) //needs to check if the date exist since undefined can't be changed.  Turns date into a string and cuts it to the 0-10th character.
}

function updateDate() {
    const date = this.updatedAt
    const month = date.toLocaleString('default', { month: 'short' });
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    const displayDate = `${month} ${date.getDate()}, ${date.getFullYear()} at ${time}`
    return displayDate;
}

function displayImage() {
    return this.images.path.replace('/upload', '/upload/w_500,h_500,c_limit')
}

module.exports = {
    createSlug,
    imageDelete,
    formDate,
    updateDate,
    displayImage,
    createReviewMaster
}