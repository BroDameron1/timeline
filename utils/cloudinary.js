const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Source = require('../models/source');

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
    constructor(url, filename, reviewData, publicData, sourceId) {
        this.url = url
        this.filename = filename
        this.reviewData = reviewData
        this.publicData = publicData || null
        this.sourceId = sourceId || null
    }

    newReviewImage () {
        this.reviewData.images = { url: this.url, filename: this.filename}
    }

    async updateReviewImage () {
        //const reviewSourceData = await Source.reviewSource.findById(this.sourceId)
        const publicSourceData = await Source.publicSource.findById(this.reviewData.publicId)
        if (publicSourceData) {
            if (this.reviewData.images.filename && this.reviewData.images.filename !== publicSourceData.images.filename) {
                await cloudinary.uploader.destroy(this.reviewData.images.filename)
            }
        }
        if (!publicSourceData && this.reviewData.images.filename) {
            await cloudinary.uploader.destroy(this.reviewData.images.filename)
        }
        this.reviewData.images = { url: this.url, filename: this.filename}
    }

    publishImage () {
        this.publicData.images = { url: this.url, filename: this.filename}
    }
    //TODO: Test this to make sure it doesn't delete public data
    async deleteImage() {
        const publicSourceData = Source.publicSource.find({ images: {filename: this.filename}})
        if (!publicSourceData) {
            await cloudinary.uploader.destroy(this.reviewData.images.filename)
        }
    }
}


module.exports = {
    cloudinary,
    storage,
    ImageHandler
}