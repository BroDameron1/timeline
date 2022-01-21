const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Source = require('../models/source');
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

// class ImageHandler {
//     constructor(url, filename, reviewData, publicData, sourceId) {
//         this.url = url
//         this.filename = filename
//         this.reviewData = reviewData
//         this.publicData = publicData || null
//         this.sourceId = sourceId || null
//     }

//     newReviewImage () {
//         this.reviewData.images = { url: this.url, filename: this.filename}
//     }

//     async updateReviewImage () {
//         //const reviewSourceData = await Source.reviewSource.findById(this.sourceId)
//         const publicSourceData = await Source.publicSource.findById(this.reviewData.publicId)
//         if (publicSourceData) {
//             if (this.reviewData.images.filename && this.reviewData.images.filename !== publicSourceData.images.filename) {
//                 await cloudinary.uploader.destroy(this.reviewData.images.filename)
//             }
//         }
//         if (!publicSourceData && this.reviewData.images.filename) {
//             await cloudinary.uploader.destroy(this.reviewData.images.filename)
//         }
//         this.reviewData.images = { url: this.url, filename: this.filename}
//     }

//     publishImage () {
//         this.publicData.images = { url: this.url, filename: this.filename}
//     }
//     //TODO: Can this logic be used in the previous two methods (and maybe combine them?)
//     async deleteReviewImage() {
//         const publicSourceData = await Source.publicSource.find({ images: {filename: this.filename}})
//         if (!publicSourceData) {
//             await cloudinary.uploader.destroy(this.reviewData.images.filename)
//         }
//     }
//     //TODO: Test
//     async deletePublicImage() {
//         const reviewSourceData = await Source.reviewSource.find({ images: { filename: this.filename }})
//         if (!reviewSourceData) {
//             await cloudinary.uploader.destroy(this.publicData.images.filename)
//         }
//     }
// }


class ImageHandler {
    // constructor(url, filename, reviewData, publicData, sourceId) {
    //     this.url = url
    //     this.filename = filename
    //     this.reviewData = reviewData
    //     this.publicData = publicData || null
    //     this.sourceId = sourceId || null
    // }

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
        //const reviewSourceData = await Source.reviewSource.findById(this.sourceId)
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
    publishImage () {
        this.recordData.images = { path: this.fileData.path, filename: this.fileData.filename}
    }
    
    //recordData is reviewData from record_handler_service for this method
    //TODO: Can this logic be used in the previous two methods (and maybe combine them?)
    //TODO: Test
    async deleteReviewImage() {
        //Cannot use publicID here because the images there may be different than the review image causing the review image to not be deleted.
        
        const publicData = await mongoose.model(this.recordProps.public).findOne({ images: {filename: this.fileData.filename}})
        console.log(publicData, 'here1')
        if (!publicData && this.recordData.images.filename) {
            await cloudinary.uploader.destroy(this.recordData.images.filename)
        }
    }
    //TODO: Test
    //recordData is publicData from record_handler_service for this method.
    async deletePublicImage() {
        const reviewData = await mongoose.model(this.recordProps.review).findOne({ images: { filename: this.fileData.filename }})
        if (!reviewData && this.recordData.images.filename) {
            await cloudinary.uploader.destroy(this.recordData.images.filename)
        }
    }
}


module.exports = {
    cloudinary,
    storage,
    ImageHandler
}