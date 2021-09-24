const Source = require('../models/source');
const mongoose = require('mongoose');
const ExpressError = require('../utils/expressError');
const duplicateChecker = require('../utils/duplicateChecker')
const { cloudinary } = require('../utils/cloudinary')

//controller for get route for rendering any existing source.
//TODO: Handle failed to cast errors in other sections
module.exports.renderSource = async (req, res) => {
    const { slug } = req.params
    const publicSourceData = await Source.publicSource.findOne({slug}).populate('author', 'username')
    if (!publicSourceData) {
        req.flash('error', 'This record does not exist.')
        return res.redirect('/dashboard')
    }
    res.render('sources/source', { publicSourceData })
}

//controller for get route for rendering the New Source submission form.
module.exports.renderNewSource = async (req, res) => {
    const mediaTypes = await Source.reviewSource.schema.path('mediaType').enumValues
    res.render('sources/newSource', { mediaTypes })
}

//controller for the post route for submitting a New Source to be approved.
module.exports.submitNewSource = async (req, res) => {
    const reviewSourceData = new Source.reviewSource(req.body)
    const duplicateCheck = await duplicateChecker.submitNew(reviewSourceData.title, reviewSourceData.mediaType)
    if (duplicateCheck) {
        req.flash('error', 'This record already exists.')
        return res.redirect('/sources/new')
    }
    reviewSourceData.updateAuthor(reviewSourceData.author, req.user._id)
    console.log(req.file)
    reviewSourceData.images = { url: req.file.path, filename: req.file.filename}
    reviewSourceData.state = 'new'
    await reviewSourceData.save()
    req.flash('info', 'Your new Source has been submitted for approval.')
    res.redirect('/dashboard');
}

//renders the page for an admin to update and approve any review record
module.exports.renderReviewSource = async (req, res) => {
    const { sourceId } = req.params
    const reviewSourceData = await Source.reviewSource.findById(sourceId)
    if (!reviewSourceData) {
        req.flash('error', 'This record does not exist')
        return res.redirect('/dashboard')
    }
    if (reviewSourceData.state === 'approved' || reviewSourceData.state === 'rejected') {
        req.flash('error', 'This article has already been reviewed.')
        return res.redirect('/dashboard')
    }
    if (reviewSourceData.checkedOut) {
        req.flash('error', 'This record is currently in use.')
        return res.redirect('/dashboard')
    }
    const mediaTypes = await Source.reviewSource.schema.path('mediaType').enumValues
    res.render('sources/publishSource', { mediaTypes, data: reviewSourceData })
}

//allows the publishing of any review record (whether a new record or an updated one)w
//TODO: SAVE THE REVIEW CHANGES AND THEN SET PUBLIC BODY TO EQUAL REVIEW BODY?!?
//currently using req.body to capture changes made by the admin.
module.exports.publishReviewSource = async (req, res) => {
    const { sourceId } = req.params
    const reviewSourceData = await Source.reviewSource.findById(sourceId)
    let publicSourceData = await Source.publicSource.findById(reviewSourceData.publicId)
    if (!publicSourceData) {
        publicSourceData = new Source.publicSource(req.body)
    } else {
        publicSourceData.set({ ...req.body })
    }
    const duplicateCheck = await duplicateChecker.publishRecord(publicSourceData.title, publicSourceData.mediaType, sourceId)

    if (duplicateCheck) {
        req.flash('error', 'This record already exists.')
        return res.redirect('/dashboard')
    }
    if (reviewSourceData.author[0].equals(req.user._id)) {
        req.flash('error', "You can't approve your own article you weirdo. How did you even get here?")
        return res.redirect('/dashboard')
    }
    //updates the image if the admin changed the image.
    //TODO: Fix it so the reviewSourceData image doesn't have to be deleted.
    if (req.file) {
        await cloudinary.uploader.destroy(reviewSourceData.images.filename)
        reviewSourceData.images = { url: req.file.path, filename: req.file.filename}
        publicSourceData.images = { url: req.file.path, filename: req.file.filename}
    //if the reviewsource image was updated, this will check if there is a public image already and delete it if it's url is different than the reviewsource image.
    } else if (publicSourceData.images.url && reviewSourceData.images.url !== publicSourceData.images.url) {
        await cloudinary.uploader.destroy(publicSourceData.images.filename)
        publicSourceData.images.url = reviewSourceData.images.url
        publicSourceData.images.filename = reviewSourceData.images.filename
    } else {
    //will set the publicsource image data to the review source image data
        publicSourceData.images.url = reviewSourceData.images.url
        publicSourceData.images.filename = reviewSourceData.images.filename
    }
    publicSourceData.state = 'published'
    publicSourceData.lastApprover = req.user._id
    publicSourceData.checkedOut = false
    publicSourceData.updateAuthor(publicSourceData.author, reviewSourceData.author[0])
    reviewSourceData.state = 'approved'
    await reviewSourceData.save()
    await publicSourceData.save()
    res.redirect(`/sources/${publicSourceData.slug}`)
}

//renders the page for a user to update an already submitted review record
module.exports.renderUpdateReviewSource = async (req, res) => {
    const { sourceId } = req.params
    const reviewSourceData = await Source.reviewSource.findById(sourceId)
    if (!reviewSourceData) {
        req.flash('error', 'This record does not exist')
        return res.redirect('/dashboard')
    }
    if (reviewSourceData.state === 'approved' || reviewSourceData.state === 'rejected') {
        req.flash('error', 'This record has already been reviewed.')
        return res.redirect('/dashboard')
    }
    if (reviewSourceData.checkedOut) {
        req.flash('error', 'This record is currently in use.')
        return res.redirect('/dashboard')
    }
    const mediaTypes = await Source.reviewSource.schema.path('mediaType').enumValues
    res.render('sources/updateReviewSource', { data: reviewSourceData, mediaTypes})
}

//allows submission of an update to an already submitted review record
module.exports.submitUpdateReviewSource = async (req, res) => {
    const { sourceId } = req.params
    const reviewSourceData = await Source.reviewSource.findById(sourceId)
    reviewSourceData.set({ ...req.body })
    if (req.file) {
        await cloudinary.uploader.destroy(reviewSourceData.images.filename)
        reviewSourceData.images = { url: req.file.path, filename: req.file.filename}
    }
    const duplicateCheck = await duplicateChecker.updateReview(reviewSourceData.title, reviewSourceData.mediaType, sourceId)
    if (duplicateCheck) {
        req.flash('error', 'This record already exists.')
        //TODO: fix this so it dumps them back to the form still filled out?
        return res.redirect(`/dashboard`)
    }
    if (reviewSourceData.state === 'approved' || reviewSourceData.state === 'rejected') {
        req.flash('error', 'This record is not eligible to be updated.')
        return res.redirect('/dashboard')
    }
    reviewSourceData.checkedOut = false
    await reviewSourceData.save()
    req.flash('info', 'Your changes have been saved successfully.')
    res.redirect('/dashboard')
}

//allows a user to delete a pending submitted update
module.exports.deleteReviewSource = async (req, res) => {
    const { sourceId } = req.params
    const reviewSourceData = await Source.reviewSource.findById(sourceId)
    if (reviewSourceData.state === 'published' || reviewSourceData.state === 'rejected') {
        req.flash('error', 'This record has already been reviewed and cannot be deleted.')
        return res.redirect('/dashboard')
    }
    await cloudinary.uploader.destroy(reviewSourceData.images.filename)
    await Source.reviewSource.findByIdAndDelete(sourceId)
    if (reviewSourceData.publicId) {
        const publicSourceData = await Source.publicSource.findById(reviewSourceData.publicId)
        publicSourceData.checkedOut = false
        publicSourceData.save()
    }
    req.flash('info', 'Your submission was successfully deleted.')
    res.redirect('/dashboard')
}

//renders the page for update to an existing source
module.exports.renderEditSource = async (req, res) => {
    const { slug } = req.params
    const publicSourceData = await Source.publicSource.findOne({ slug })
    if (!publicSourceData) {
        req.flash('error', 'This record does not exist')
        return res.redirect('/dashboard')
    }
    if (publicSourceData.checkedOut) {
        req.flash('error', 'This record is currently in use.')
        return res.redirect('/dashboard')
    }
    const mediaTypes = await Source.reviewSource.schema.path('mediaType').enumValues
    res.render('sources/updatePublicSource', { data: publicSourceData, mediaTypes})
}

//allows a user to submit an update for an existing source
module.exports.submitEditSource = async (req, res) => {
    const { slug } = req.params
    const publicSourceData = await Source.publicSource.findOne({ slug })
    const reviewSourceData = new Source.reviewSource(req.body)
    const duplicateCheck = await duplicateChecker.editPublic(reviewSourceData.title, reviewSourceData.mediaType, publicSourceData._id)
    if (duplicateCheck) {
        req.flash('error', 'This record already exists.')
        return res.redirect(`/sources/${slug}`)
    }
    if (req.file) {
        reviewSourceData.images = { url: req.file.path, filename: req.file.filename}
    } else {
        reviewSourceData.images.url = publicSourceData.images.url
        reviewSourceData.images.filename = publicSourceData.images.filename
    }
    reviewSourceData.author.unshift(req.user._id)
    reviewSourceData.publicId = publicSourceData._id;
    reviewSourceData.state = 'update';
    publicSourceData.checkedOut = true;
    await publicSourceData.save()
    await reviewSourceData.save()
    req.flash('info', 'Your update request has been submitted')
    res.redirect('/dashboard')
}

//controller to check for duplicate data by passing the title, mediaType, and sometimes review Id through
//to check against the review and public collections
module.exports.getData = async (req, res) => {
    const { title, mediaType, type, sourceId } = req.query
    if (type === 'submitNew') {
        const duplicateResult = await duplicateChecker.submitNew(title, mediaType)
        return res.json(duplicateResult)
    }
    if (type === 'updateReview') {
        const duplicateResult = await duplicateChecker.updateReview(title, mediaType, sourceId)
        return res.json(duplicateResult)
    }
    if (type === 'publishRecord') {
        const duplicateResult = await duplicateChecker.publishRecord(title, mediaType, sourceId)
        return res.json(duplicateResult)
    }
    if (type === 'editPublic') {
        const duplicateResult = await duplicateChecker.editPublic(title, mediaType, sourceId)
        return res.json(duplicateResult)
    }
}

//controller for put route that let's JS files update data.  Right now only for
//updating state of record
module.exports.putData = async (req, res) => {
    const { checkedOut, sourceId, collection } = req.body
    const dataToUpdate = await mongoose.model(collection).findById(sourceId)
    dataToUpdate.checkedOut = checkedOut
    await dataToUpdate.save()
    res.status(200).end()
}