const Source = require('../models/source');
const ExpressError = require('../utils/expressError');

module.exports.renderSource = async (req, res) => {
    const publicSourceData = await Source.publicSource.findById(req.params.sourceId)
    res.render('sources/source', { publicSourceData })
}

module.exports.renderNewSource = async (req, res) => {
    //const reviewSourceData = req.flash('data')[0] || null
    //console.log(reviewSourceData)
    const mediaTypes = await Source.reviewSource.schema.path('mediaType').enumValues
    res.render('sources/newSource', { mediaTypes })
}

module.exports.submitNewSource = async(req, res, next) => {
    const reviewSourceData = new Source.reviewSource(req.body)
    const duplicateCheck = await Source.reviewSource.checkDuplicates(reviewSourceData.title, reviewSourceData.mediaType)
    if (!duplicateCheck) {
        req.flash('error', 'This record already exists.')
        //req.flash('data', reviewSourceData)
        return res.redirect('/sources/new')
    }
    reviewSourceData.state = 'new';
    reviewSourceData.updateAuthor(reviewSourceData.author, req.user._id)
    await reviewSourceData.save()
    req.flash('info', 'Your new Source has been submitted for approval.')
    res.redirect('/dashboard');
}
