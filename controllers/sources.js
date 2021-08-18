const Source = require('../models/source');
const ExpressError = require('../utils/expressError');

module.exports.renderNewSource = async (req, res) => {
    const mediaTypes = await Source.reviewSource.schema.path('mediaType').enumValues
    res.render('sources/newSource', { mediaTypes });
}

module.exports.newSource = async (req, res, next) => {
//TODO: Handle duplicate errors without leaving the page?
//TODO: Update duplicate error to pass custom message
//TODO: Duplicate should only trigger on same TITLE and MEDIA TYPE
        const reviewSourceData = new Source.reviewSource(req.body);
        reviewSourceData.state = 'new';
        reviewSourceData.updateAuthor(reviewSourceData.author, req.user._id)
        //reviewSourceData.author.unshift(req.user._id)
        await reviewSourceData.save((err, doc) => {
            if (err) return next(err);
            req.flash('info', 'Your new Source has been submitted for approval.')
            res.redirect('/dashboard');
        });
}

module.exports.renderReviewSource = async (req, res) => {
//TODO: Only admins who didn't submit this should should be able to access this
//TODO: Change state
//TODO: Error properly if a bad source ID is given.
    const { sourceId } = req.params;
    const reviewSourceData = await Source.reviewSource.findOne({ _id: sourceId }).populate('author', 'username')
    const mediaTypes = await Source.reviewSource.schema.path('mediaType').enumValues;
    res.render('sources/reviewSource', { reviewSourceData, mediaTypes })
}

module.exports.publishSource = async (req, res) => {
    const { sourceId } = req.params;
//TODO: extract this to a reusable function.

    const publicSourceData = new Source.publicSource(req.body);
    const reviewSourceData = await Source.reviewSource.findOne({ _id: sourceId })
    if (reviewSourceData.author[0].equals(req.user._id)) {
        req.flash('error', "You can't approve your own article you weirdo. How did you even get here?")
        return res.redirect('/dashboard')
    }
    publicSourceData.author = reviewSourceData.author;
    publicSourceData.state = 'published';
    await publicSourceData.save();
    reviewSourceData.state = 'approved';
    await reviewSourceData.save();
    res.redirect(`/sources/${publicSourceData._id}`)
}

module.exports.renderSource = async (req, res) => {
    const { sourceId } = req.params;
    const publicSourceData = await Source.publicSource.findOne({ _id: sourceId }).populate('author', 'username')
    res.render('sources/source', { publicSourceData })
}

module.exports.renderEditSource = async (req, res) => {
//TODO: Fix so it properly errors if a bad ID is sent.
//TODO: Can this be made redundant with renderReviewSource
    const { sourceId } = req.params;
    const publicSourceData = await Source.publicSource.findOne({ _id: sourceId })
    const mediaTypes = await Source.publicSource.schema.path('mediaType').enumValues;
    res.render('sources/editSource', { publicSourceData, mediaTypes })
}

module.exports.editSource = async (req, res) => {
    //TODO: Once approved, this creates a whole new record in the DB instead of overwriting the original
    const { sourceId } = req.params;
    const reviewSourceData = new Source.reviewSource(req.body);
    const publicSourceData = await Source.publicSource.findOne({ _id: sourceId })
    reviewSourceData.author.unshift(req.user._id)
    //reviewSourceData.updateAuthor(publicSourceData.author, req.user._id)
    reviewSourceData.state = 'update';
    reviewSourceData.publicId = sourceId;
    publicSourceData.state = 'checked out';
    await reviewSourceData.save();
    await publicSourceData.save();
    res.redirect('/dashboard')
}

module.exports.publishEditSource = async (req, res) => {
    //TODO: Error properly if request has already been approved.
    const { sourceId } = req.params
    const reviewSourceData = await Source.reviewSource.findOne({ _id: sourceId })
    const publicSourceData = await Source.publicSource.findByIdAndUpdate(reviewSourceData.publicId, { ...req.body })
    console.log(publicSourceData)
    publicSourceData.updateAuthor(publicSourceData.author, reviewSourceData.author[0])
    //publicSourceData.author = reviewSourceData.author
    reviewSourceData.state = 'approved'
    reviewSourceData.publicId = ''
    publicSourceData.state = 'published'
    await reviewSourceData.save()
    await publicSourceData.save()
    res.redirect(`/sources/${publicSourceData._id}`)
}

module.exports.deletePublicSource = async (req, res) => {
    //TODO: Add delete confirmation.
    const { sourceId } = req.params;
    await Source.publicSource.findByIdAndDelete(sourceId)
    req.flash('info', 'The record has been successfully deleted.')
    res.redirect('/dashboard')
}

module.exports.deleteReviewSource = async (req, res) => {
    //TODO: Add Delete confirmation
    //TODO: Add more backend functionality to confirm user before delete (mongoose middleware?)
    await Source.reviewSource.findByIdAndDelete(req.params.sourceId);
    req.flash('info', 'Your pending record has been successfully deleted.')
    res.redirect('/dashboard')
}

module.exports.renderUpdateSource = async (req, res) => {
    //Must be able to review/approve (as admin) (/review route, post or put to public)
    //Must be able to update existing submission (as owner of submission) (update route, put to review)
    //Must be able to submit changes to public documents (as anyone) (put to review)
        const { sourceId } = req.params;
        const getSourceData = async () => {
            let sourceData = await Source.publicSource.findOne({ _id: sourceId })
            if (!sourceData) {
                sourceData = await Source.reviewSource.findOne({ _id: sourceId})
            }
            return sourceData;
        }
        const mediaTypes = await Source.publicSource.schema.path('mediaType').enumValues;
        const sourceData = await getSourceData();
        console.log(sourceData)
        res.render('sources/updateSource', { sourceData, mediaTypes })
    }

module.exports.changeEditSource = async (req, res) => {
    const { sourceId } = req.params;
    const reviewSourceData = await Source.reviewSource.findByIdAndUpdate(sourceId, { ...req.body });
    await reviewSourceData.save()
    req.flash('info', 'Your updates have been submitted.');
    res.redirect('/dashboard')
} 