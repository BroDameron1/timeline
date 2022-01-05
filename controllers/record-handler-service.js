//const { isValidObjectId } = require("mongoose")
const duplicateChecker = require('../utils/duplicateChecker')
const { ImageHandler } = require('../utils/cloudinary')


class RecordHandler {
    constructor(req, res, template) {
        this.req = req
        this.res = res
        this.template = template || null
        this.redirectUrl = '/dashboard'
    }

    // get renderSourceTest() {
    //     console.log('test3')
    //     return this.renderSource()
    // }

    async dataLookup(dbCollection) {
        const { slug, sourceId } = this.req.params
        let data
        if (slug) {
            data = await dbCollection.findOne({ slug })
                .populate('author', 'username')
                .populate('lastApprover', 'username')
        } else {
            data = await dbCollection.findById(sourceId)
                .populate('author', 'username')
                .populate('lastApprover', 'username')
        }
        return data
    }

    //this is being checked in the middleware.  TODO: Have the middleware call this method to reduce code duplication
    // checkMongoId(sourceId) {
    //     console.log('failed here')
    //     if (!ObjectID.isValid(sourceId)) {
    //         console.log('failed here')
    //         this.req.flash('error', 'This record does not exist.')
    //         return this.res.redirect(this.redirectUrl)
    //     }
    // }

    async publishReviewData(reviewDb, publicDb) {
        const { sourceId } = this.req.params
        const reviewData = await this.dataLookup(reviewDb)
        let publicData = await publicDb.findById(reviewData.publicId)
        if (!publicData) {
            publicData = new publicDb(this.req.body)
        } else {
            publicData.set({ ...this.req.body })
        }
        //TODO: NEEDS TO BE FIXED FOR OTHER RECORDS
        const duplicateCheck = await duplicateChecker.publishRecord(publicData.title, publicData.mediaType, sourceId)
        if (duplicateCheck) {
            this.req.flash('error', 'A record with these details already exists.')
            return this.res.redirect(this.redirectUrl)
        }
        if (reviewData.author[0].equals(this.req.user._id)) {
            this.req.flash('error', "You can't approve your own article you weirdo. How did you even get here?")
            return this.res.redirect(this.redirectUrl)
        }
        //TODO: Streamline image handling?
        if (this.req.file) {
            const image = new ImageHandler(this.req.file.path, this.req.file.filename, reviewData, publicData)
            image.publishImage()
        } else {
            const image = new ImageHandler(reviewData.images.url, reviewData.images.filename, reviewData, publicData)
            image.publishImage()
        }
        publicData.state = 'published'
        publicData.lastApprover = this.req.user._id
        publicData.checkedOut = false
        publicData.adminNotes = ''
        this.updateAuthor(publicData, reviewData.author[0]) //TODO: Make sure this works.
        await publicData.save()
        reviewData.adminNotes = this.req.body.adminNotes
        reviewData.lastApprover = this.req.user._id
        reviewData.state = 'approved'
        await reviewData.save()
        this.res.redirect(this.template+publicData.slug)
    }

    async editReviewData(reviewDb) {
        const { sourceId } = this.req.params
        const reviewData = await this.dataLookup(reviewDb)
        reviewData.set({ ...this.req.body })
        if (this.req.file) {
            const image = new ImageHandler(this.req.file.path, this.file.filename, reviewData)
            await image.updateReviewImage()
        }
        const duplicateCheck = await duplicateChecker.updateReview(reviewData.title, reviewData.mediaType, sourceId)
        if (duplicateCheck) {
            this.req.flash('error', 'This record already exists.')
            return this.res.redirect(this.redirectUrl)
        }
        this.checkApprovalState(reviewData)
        reviewData.checkedOut = false
        await reviewData.save()
        this.req.flash('info', 'Your changes have been saved successfully.')
        this.res.redirect(this.redirectUrl)
    }

    async deleteReviewData(reviewDb, publicDb) {
        const { sourceId } = this.req.params
        const reviewData = await this.dataLookup(reviewDb)
        this.checkApprovalState(reviewData)
        const image = new ImageHandler(reviewData.images.url, reviewData.images.filename, reviewData)
        await image.deleteReviewImage()
        await reviewDb.findByIdAndDelete(sourceId)
        if (reviewData.publicId) {
            const publicData = await publicDb.findById(reviewData.publicId)
            publicData.checkedOut = false
            publicData.save()
        }
        this.req.flash('info', 'Your submission was successfully deleted.')
        this.res.redirect(this.redirectUrl)
    }

    async newDataPost(reviewDb) {
        const data = new reviewDb(this.req.body)
        const duplicateCheckResult = await duplicateChecker.submitNew(data.title, data.mediaType)
        if (duplicateCheckResult) {
            req.flash('error', 'This record already exists.')
            return res.redirect(this.redirectUrl)
        }
        this.updateAuthor(data, this.req.user._id) //TODO: add author handling to this class instead of in the DB model
        if(this.req.file) {
            const image = new ImageHandler(this.req.file.path, this.req.file.filename, data)
            image.newReviewImage()
        }
        data.state = 'new'
        await data.save()
        this.req.flash('info', 'Your new Source has been submitted for approval.')
        return this.res.redirect(this.redirectUrl);
    }

    checkApprovalState(reviewData) {
        if (reviewData.state === 'approved' || reviewData.state === 'rejected') {
            this.req.flash('error', 'This record is not eligible to be editted or deleted.')
            return this.res.redirect(this.redirectUrl)
        }
    }

    checkData(data) {
        if (!data) {
            this.req.flash('error', 'This record does not exist.')
            return this.res.redirect(this.redirectUrl)
        }
    }

    renderData(data) {
        return this.res.render(this.template, { data })
    }

    updateAuthor(data, newAuthor) {
        data.author = data.author.filter(previousAuthor => !previousAuthor.equals(newAuthor))
        data.author.unshift(newAuthor)
        if (data.author.length > 5) {
            data.author.splice(5)
        }
    }
}

module.exports = {
    RecordHandler
}