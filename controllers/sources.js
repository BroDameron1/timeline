const Source = require('../models/source');
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

//controller for the post route for submitting a New Source to be approved.
module.exports.submitNewSource = async(req, res) => {
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



//controller for get route that let's JS files query for data.  Right now only for 
//checking duplicates but may be needed for other things.
//TODO: See if this can be put in the renderSource route
module.exports.getData = async (req, res) => {
    const { title, mediaType } = req.query
    const duplicateResult = await Source.reviewSource.checkDuplicates(title, mediaType)
    res.json(duplicateResult)
}

//controller for put route that let's JS files update data.  Right now only for
//updating state of record
module.exports.putData = async (req, res) => {
    const { state, sourceId } = req.body
    const reviewSourceData = await Source.reviewSource.findById(sourceId)
    reviewSourceData.state = state
    await reviewSourceData.save()
    res.status(200)
}