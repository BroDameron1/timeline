const Source = require('../models/source');
const mongoose = require('mongoose');
const ExpressError = require('../utils/expressError');

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
    const duplicateCheck = await Source.reviewSource.checkDuplicates(reviewSourceData.title, reviewSourceData.mediaType)
    //backup duplicate check if the front end fails.
    if (duplicateCheck) {
        req.flash('error', 'This record already exists.')
        return res.redirect('/sources/new')
    }
    //updates the author array in the Review Source which will be passed along to the public source.
    reviewSourceData.updateAuthor(reviewSourceData.author, req.user._id)
    reviewSourceData.state = 'new'
    await reviewSourceData.save()
    req.flash('info', 'Your new Source has been submitted for approval.')
    res.redirect('/dashboard');
}

//controller for get route for editting a pending approval source.
module.exports.renderEditNew = async (req, res) => {
    const { sourceId } = req.params;
    const reviewSourceData = await Source.reviewSource.findById(sourceId)
    if (!reviewSourceData) {
        req.flash('error', 'This record does not exist')
        return res.redirect('/dashboard')
    }
    if (reviewSourceData.state === 'checked out') {
        req.flash('error', 'This record is currently in use.')
        return res.redirect('/dashboard')
    }
    const mediaTypes = await Source.reviewSource.schema.path('mediaType').enumValues
    res.render('sources/editNew', { reviewSourceData, mediaTypes })
}

//controller for publishing changes to an existing "new" source
//TODO: Try to combine this with publishing changes to existing "review" source
module.exports.submitEditNew = async (req, res) => {
    const { sourceId } = req.params
    const duplicateCheck = await Source.reviewSource.checkDuplicates(req.body.title, req.body.mediaType, sourceId)
    if (duplicateCheck) {
        req.flash('error', 'This record already exists.')
        return res.redirect('/sources/new')
    }
    await Source.reviewSource.findByIdAndUpdate(sourceId, { ...req.body, state: 'new' }, {new: true})
    req.flash('info', 'Your submission has been updated.')
    res.redirect('/dashboard')
}



//controller for publishing new "review" records to public records.
module.exports.publishNewSource = async (req, res) => {
    const { sourceId } = req.params
    const publicSourceData = new Source.publicSource(req.body)
    const reviewSourceData = await Source.reviewSource.findById(sourceId)
    const duplicateCheck = await Source.publicSource.checkPublicDuplicates(publicSourceData.title, publicSourceData.mediaType)
    if (duplicateCheck) {
        req.flash('error', 'This record already exists.')
        return res.redirect(`/sources/review/${sourceId}`)
    }
    if (reviewSourceData.author[0].equals(req.user._id)) {
        req.flash('error', "You can't approve your own article you weirdo. How did you even get here?")
        return res.redirect('/dashboard')
    }
    publicSourceData.updateAuthor(publicSourceData.author, reviewSourceData.author[0])
    publicSourceData.state = 'published'
    reviewSourceData.state = 'approved'
    await publicSourceData.save()
    await reviewSourceData.save()
    res.redirect(`/sources/${publicSourceData._id}`)
}

//controller for rendering the form to update an existing record.
module.exports.renderEditPublicSource = async (req, res) => {
    const { sourceId } = req.params
    const publicSourceData = await Source.publicSource.findById(sourceId)
    if (!publicSourceData) {
        req.flash('error', 'This record does not exist.')
        return res.redirect('/dashboard')
    }
    const mediaTypes = await Source.reviewSource.schema.path('mediaType').enumValues
    res.render('sources/editPublic', { publicSourceData, mediaTypes })
}

//controller for submitting an update to an existing record for review and approval.
module.exports.submitEditPublicSource = async (req, res) => {
    const { sourceId } = req.params
    const publicSourceData = await Source.publicSource.findById(sourceId)
    const reviewSourceData = new Source.reviewSource(req.body)
    const duplicateCheck = await Source.reviewSource.checkDuplicates(reviewSourceData.title, reviewSourceData.mediaType)
    if (duplicateCheck) {
        req.flash('error', 'This record already exists.')
        return res.redirect(`/sources/review/${sourceId}`)
    }
    reviewSourceData.author.unshift(req.user._id)
    reviewSourceData.publicId = sourceId;
    reviewSourceData.state = 'update';
    publicSourceData.state = 'checked out';
    await reviewSourceData.save();
    await publicSourceData.save();
    req.flash('info', 'Your changes have been submitted for review.')
    res.redirect(`/sources/${sourceId}`)
}

//controller to check for duplicate data by passing the title, mediaType, and sometimes review Id through
//to check against the review and public collections
module.exports.getData = async (req, res) => {
    const { title, mediaType, collection, sourceId } = req.query
    if (collection === 'both') {
        const duplicateResult = await Source.reviewSource.checkDuplicates(title, mediaType, sourceId)
        return res.json(duplicateResult)
    }
    if (collection === 'public') {
        const duplicateResult = await Source.publicSource.checkPublicDuplicates(title, mediaType)
        return res.json(duplicateResult)
    }
    const queryResults = await mongoose.model(collection).findById(sourceId)
    res.json(queryResults)
}

//controller for put route that let's JS files update data.  Right now only for
//updating state of record
module.exports.putData = async (req, res) => {
    const { state, sourceId, collection } = req.body
    const dataToUpdate = await mongoose.model(collection).findById(sourceId)
    dataToUpdate.state = state
    await dataToUpdate.save()
    res.status(200).end()
}