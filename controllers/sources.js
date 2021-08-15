const Source = require('../models/source');
const ExpressError = require('../utils/expressError');

module.exports.renderCreateSource = async (req, res) => {
    const mediaTypes = await Source.sourceReview.schema.path('mediaType').enumValues
    res.render('sources/createSource', { mediaTypes });
}

module.exports.createSource = async (req, res, next) => {
//TODO: Handle duplicate errors without leaving the page?
//TODO: Update duplicate error to pass custom message
//TODO: Duplicate should only trigger on same TITLE and MEDIA TYPE
        const source = new Source.sourceReview(req.body);
        source.state = 'new';
        source.author.unshift(req.user._id)
        await source.save((err, doc) => {
            if (err) return next(err);
            req.flash('info', 'Your new Source has been submitted for approval.')
            res.redirect('/dashboard');
        });
}

module.exports.renderReviewSource = async (req, res) => {
//TODO: Handle if no id exists
//TODO: Only admins who didn't submit this should should be able to access this
//TODO: Change state
    const { sourceId } = req.params;
    const reviewSource = await Source.sourceReview.findOne({ _id: sourceId }).populate('author', 'username')
    const mediaTypes = await Source.sourceReview.schema.path('mediaType').enumValues
    res.render('sources/reviewSource', { reviewSource, mediaTypes })
}

module.exports.publishSource = async (req, res) => {
    const { sourceId } = req.params;
//TODO: extract this to a reusable function.
    const publishedSource = new Source.sourcePublished(req.body);
    const reviewedSource = await Source.sourceReview.findOne({ _id: sourceId })
    console.log(reviewedSource, req.user._id)
    if (reviewedSource.author.toString() === req.user._id.toString()) {
        req.flash('error', "You can't approve your own article you weirdo. How did you even get here?")
        return res.redirect('/dashboard')
    }
    publishedSource.author.unshift(reviewedSource.author)
    publishedSource.state = 'published';
    await publishedSource.save();
    reviewedSource.state = 'approved';
    await reviewedSource.save();
    res.redirect(`/sources/${publishedSource._id}`)
}

module.exports.renderSource = async (req, res) => {
    const { sourceId } = req.params;
    const sourceData = await Source.sourcePublished.findOne({ _id: sourceId }).populate('author', 'username')
    console.log(sourceData)
    res.render('sources/source', { sourceData })
}

//TODO: Revisit later.  We need an edit source for sourceReview and sourceFinal
//Only the author and admin should be able to edit while in sourceReview.
//may be able to r
// module.exports.renderEditSource = async (req, res) => {
//     const { sourceId } = req.params;
//     const editSource = await Source.source
// }