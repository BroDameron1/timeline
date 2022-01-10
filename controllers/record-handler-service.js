//const { isValidObjectId } = require("mongoose")
const duplicateChecker = require('../utils/duplicateChecker')
const { ImageHandler } = require('../utils/cloudinary')


class RecordHandler {
    constructor(req, res, recordDb, template) {
        this.req = req
        this.res = res
        this.recordDb = recordDb
        this.template = template || null
        this.redirectUrl = '/dashboard'
    }

    async dataLookup(dbToCheck) {
        const { slug, sourceId } = this.req.params
        let dbPlaceholder
        let data
        if (dbToCheck === 'review') dbPlaceholder = this.recordDb.review
        if (dbToCheck === 'public') dbPlaceholder = this.recordDb.public
        if (slug) {
            data = await dbPlaceholder.findOne({ slug })
                .populate('author', 'username')
                .populate('lastApprover', 'username')
        } else {
            data = await dbPlaceholder.findById(sourceId)
                .populate('author', 'username')
                .populate('lastApprover', 'username')
        }
        return data
    }


    async publishReviewRecord() {
        const { sourceId } = this.req.params
        const reviewData = await this.dataLookup('review')
        let publicData = await this.recordDb.public.findById(reviewData.publicId)
        if (!publicData) {
            publicData = new this.recordDb.public(this.req.body)
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

    async editReviewRecord() {
        const { sourceId } = this.req.params
        const reviewData = await this.dataLookup('review')
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

    async editPublicRecord() {
        const publicData = await this.dataLookup('public')
        const reviewData = new this.recordDb.review(this.req.body)
        const duplicateCheck = await duplicateChecker.editPublic(reviewData.title, reviewData.mediaType, publicData._id)
        if (duplicateCheck) {
            this.req.flash('error', 'This record already exists.')
            return this.res.redirect(this.template+publicData.slug)
        }
        if (this.req.file) {
            reviewData.images = { url: this.req.file.path, filename: this.req.file.filename}
        } else {
            reviewData.images.url = publicData.images.url
            reviewData.images.filename = publicData.images.filename
        }
        reviewData.author.unshift(this.req.user._id)
        reviewData.publicId = publicData._id;
        reviewData.state = 'update';
        await reviewData.save()
        publicData.checkedOut = true;
        await publicData.save()
        this.req.flash('info', 'Your update request has been submitted')
        this.res.redirect(this.redirectUrl)
    }

    async deletePublicRecord() {
        const publicData = await this.dataLookup('public')
        if (publicData.images.url) {
            const image = new ImageHandler(publicData.images.url, publicData.images.filename, null, publicData)
            await image.deletePublicImage()
        }
        await publicData.delete()
        this.res.redirect(this.redirectUrl)
    }

    async deleteReviewData() {
        const { sourceId } = this.req.params
        const reviewData = await this.dataLookup('review')
        this.checkApprovalState(reviewData)
        const image = new ImageHandler(reviewData.images.url, reviewData.images.filename, reviewData)
        await image.deleteReviewImage()
        await this.recordDb.review.findByIdAndDelete(sourceId)
        if (reviewData.publicId) {
            const publicData = await this.recordDb.public.findById(reviewData.publicId)
            publicData.checkedOut = false
            publicData.save()
        }
        this.req.flash('info', 'Your submission was successfully deleted.')
        this.res.redirect(this.redirectUrl)
    }

    async createNewRecord() {
        const reviewData = new this.recordDb.review(this.req.body)
        const duplicateCheckResult = await duplicateChecker.submitNew(reviewData.title, reviewData.mediaType)
        if (duplicateCheckResult) {
            req.flash('error', 'This record already exists.')
            return res.redirect(this.redirectUrl)
        }
        this.updateAuthor(reviewData, this.req.user._id) //TODO: add author handling to this class instead of in the DB model
        if(this.req.file) {
            const image = new ImageHandler(this.req.file.path, this.req.file.filename, reviewDdata)
            image.newReviewImage()
        }
        reviewData.state = 'new'
        await reviewData.save()
        this.req.flash('info', 'Your new Source has been submitted for approval.')
        return this.res.redirect(this.redirectUrl);
    }

    //can this be done in a middleware?
    checkApprovalState(reviewData) {
        if (reviewData.state === 'approved' || reviewData.state === 'rejected') {
            this.req.flash('error', 'This record is not eligible to be editted or deleted.')
            this.res.redirect(this.redirectUrl)
            return true
        }
    }


    async renderPage(data, staticFields) {
        if (!data) {
            this.req.flash('error', 'This record does not exist.')
            return this.res.redirect(this.redirectUrl)
        }
        const staticFieldOptions = new Object()
        if (staticFields) {
            for (let field of staticFields) {
                staticFieldOptions[field] = await this.recordDb.review.schema.path(field).enumValues
            }
        }
        return this.res.render(this.template, { data, staticFieldOptions })
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