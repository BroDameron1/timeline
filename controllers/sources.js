const Source = require('../models/source');
const mongoose = require('mongoose');
const ExpressError = require('../utils/expressError');
const duplicateChecker = require('../utils/duplicateChecker')

//controller for get route for rendering any existing source.
//TODO: Handle failed to cast errors
module.exports.renderSource = async (req, res) => {
    const { sourceId } = req.params
    const publicSourceData = await Source.publicSource.findById(sourceId).populate('author', 'username')
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
    //TODO: Replace!
    // const duplicateCheck = await Source.reviewSource.checkDuplicates(reviewSourceData.title, reviewSourceData.mediaType)
    // //backup duplicate check if the front end fails.
    // if (duplicateCheck) {
    //     req.flash('error', 'This record already exists.')
    //     return res.redirect('/sources/new')
    // }
    //updates the author array in the Review Source which will be passed along to the public source.
    reviewSourceData.updateAuthor(reviewSourceData.author, req.user._id)
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
    if (reviewSourceData.checkedOut) {
        req.flash('error', 'This record is currently in use.')
        return res.redirect('/dashboard')
    }
    const mediaTypes = await Source.reviewSource.schema.path('mediaType').enumValues
    res.render('sources/publishSource', { reviewSourceData, mediaTypes })
}

//allows the publishing of any review record (whether a new record or an updated one)
module.exports.publishReviewSource = async (req, res) => {
    const { sourceId } = req.params
    const reviewSourceData = await Source.reviewSource.findById(sourceId)
    let publicSourceData = await Source.publicSource.findById(reviewSourceData.publicId)
    if (!publicSourceData) {
        publicSourceData = new Source.publicSource(req.body)
    } else {
        publicSourceData.set({ ...req.body })
    }
    //TODO: Replace this
    // const duplicateCheck = await Source.publicSource.checkPublicDuplicates(publicSourceData.title, publicSourceData.mediaType, reviewSourceData.publicId)
    // if (duplicateCheck) {
    //     req.flash('error', 'This record already exists.')
    //     return res.redirect(`/sources/review/${sourceId}`)
    // }
    if (reviewSourceData.author[0].equals(req.user._id)) {
        req.flash('error', "You can't approve your own article you weirdo. How did you even get here?")
        return res.redirect('/dashboard')
    }
    publicSourceData.state = 'published'
    publicSourceData.checkedOut = false
    publicSourceData.updateAuthor(publicSourceData.author, reviewSourceData.author[0])
    reviewSourceData.state = 'approved'
    await reviewSourceData.save()
    await publicSourceData.save()
    res.redirect(`/sources/${publicSourceData._id}`)
}

//renders the page for a user to update an already submitted review record
module.exports.renderUpdateReviewSource = async (req, res) => {
    const { sourceId } = req.params
    const reviewSourceData = await Source.reviewSource.findById(sourceId)
    if (!reviewSourceData) {
        req.flash('error', 'This record does not exist')
        return res.redirect('/dashboard')
    }
    if (reviewSourceData.checkedOut) {
        req.flash('error', 'This record is currently in use.')
        return res.redirect('/dashboard')
    }
    //TODO: Test this
    if (!reviewSourceData.author[0].equals(req.user._id)) {
        req.flash('error', "You do not have permission to edit this submission.")
        return res.redirect('/dashboard')
    }
    const mediaTypes = await Source.reviewSource.schema.path('mediaType').enumValues
    res.render('sources/updateReviewSource', { reviewSourceData, mediaTypes})
}

//allows submission of an update to an already submitted review record
module.exports.submitUpdateReviewSource = async (req, res) => {
    const { sourceId } = req.params
    const reviewSourceData = await Source.reviewSource.findById(sourceId)
    reviewSourceData.set({ ...req.body })
    //TODO: Replace duplicate check logic
    // const duplicateCheck = await Source.publicSource.checkDuplicates(reviewSourceData.title, reviewSourceData.mediaType, sourceId)
    // if (duplicateCheck) {
    //     req.flash('error', 'This record already exists.')
    //     return res.redirect(`/sources/review/${sourceId}`)
    // }
    if (!reviewSourceData.author[0].equals(req.user._id)) {
        req.flash('error', "You do not have permission to edit this submission.")
        return res.redirect('/dashboard')
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

//renders the page for update to an existing source
module.exports.renderEditSource = async (req, res) => {
    const { sourceId } = req.params
    const publicSourceData = await Source.publicSource.findById(sourceId)
    if (!publicSourceData) {
        req.flash('error', 'This record does not exist')
        return res.redirect('/dashboard')
    }
    if (publicSourceData.checkedOut) {
        req.flash('error', 'This record is currently in use.')
        return res.redirect('/dashboard')
    }
    const mediaTypes = await Source.reviewSource.schema.path('mediaType').enumValues
    res.render('sources/updatePublicSource', { publicSourceData, mediaTypes})
}

//allows a user to submit an update for an existing source
module.exports.submitEditSource = async (req, res) => {
    const { sourceId } = req.params
    const publicSourceData = await Source.publicSource.findById(sourceId)
    const reviewSourceData = new Source.reviewSource(req.body)
    // const duplicateCheck = await Source.reviewSource.checkDuplicates(reviewSourceData.title, reviewSourceData.mediaType, sourceId)
    // if (duplicateCheck) {
    //     req.flash('error', 'This record already exists.')
    //     return res.redirect(`/sources/${sourceId}`)
    // }
    reviewSourceData.author.unshift(req.user._id)
    reviewSourceData.publicId = sourceId;
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
    const { title, mediaType, collection, sourceId } = req.query
    if (collection === 'submitNew') {
        const duplicateResult = await duplicateChecker.submitNew(title, mediaType)
        return res.json(duplicateResult)
    }
    if (collection === 'updateReview') {
        const duplicateResult = await duplicateChecker.updateReview(title, mediaType, sourceId)
        return res.json(duplicateResult)
    }
    if (collection === 'publishRecord') {
        const duplicateResult = await duplicateChecker.publishRecord(title, mediaType, sourceId)
        return res.json(duplicateResult)
    }
    if (collection === 'editPublic') {
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