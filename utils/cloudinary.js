const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const mongoose = require('mongoose');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'timeline',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
})


class ImageHandler {
    constructor(fileData, recordData, recordProps) {
        this.fileData = fileData
        this.recordData = recordData
        this.recordProps = recordProps
    }

    //recordData is reviewData from record_handler_service for this method.
    newReviewImage () {
        this.recordData.images = { path: this.fileData.path, filename: this.fileData.filename}
    }

    //recordData is reviewData from record_handler_service for this method.
    async updateReviewImage () {
        const publicData = await mongoose.model(this.recordProps.public).findById(this.recordData.publicId)
        if (publicData) {
            if (this.recordData.images.filename && this.recordData.images.filename !== publicData.images.filename) {
                await cloudinary.uploader.destroy(this.recordData.images.filename)
            }
        }
        if (!publicData && this.recordData.images.filename) {
            await cloudinary.uploader.destroy(this.recordData.images.filename)
        }
        this.recordData.images = { path: this.fileData.path, filename: this.fileData.filename}
    }

    //recordData is publicData from record_handler_service for this method.
    async publishImage () {
        const reviewData = await mongoose.model(this.recordProps.review).findOne({'images.filename': this.recordData.images.filename })
        if (!reviewData && this.recordData.images.filename) await cloudinary.uploader.destroy(this.recordData.images.filename)
        this.recordData.images = { path: this.fileData.path, filename: this.fileData.filename}
    }
}


module.exports = {
    cloudinary,
    storage,
    ImageHandler
}