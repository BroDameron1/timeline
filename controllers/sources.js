const Source = require('../models/source');
const ExpressError = require('../utils/expressError');
const { checkState, changeState } = require('../utils/checkState')

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
    await reviewSourceData.save((err, doc) => {
        if (err) return next(err);
        req.flash('info', 'Your new Source has been submitted for approval.')
        res.redirect('/dashboard');
    });
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

module.exports.renderUpdateSource = async (req, res) => {
        const { sourceId } = req.params;
        //get source data by looking at the state
        const getSourceData = async () => {
            let sourceData = await Source.publicSource.findOne({ _id: sourceId })
            if (!sourceData) {
                sourceData = await Source.reviewSource.findOne({ _id: sourceId})
            }
            return sourceData;
        }
        const sourceData = await getSourceData();
        const sourceState = checkState(sourceData);
        if (!sourceState) {
            return res.send("You can't edit this.")
        }
        const mediaTypes = await Source.publicSource.schema.path('mediaType').enumValues;
        await changeState(sourceData, 'checked out-r')
        res.render('sources/updateSource', { sourceData, mediaTypes })
}


module.exports.renderSource = async (req, res) => {
    const { sourceId } = req.params;
    const publicSourceData = await Source.publicSource.findOne({ _id: sourceId }).populate('author', 'username')
    res.render('sources/source', { publicSourceData })
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

module.exports.changeEditSource = async (req, res) => {
    const { sourceId } = req.params;
    const reviewSourceData = await Source.reviewSource.findByIdAndUpdate(sourceId, { ...req.body });
    await reviewSourceData.save()
    req.flash('info', 'Your updates have been submitted.');
    res.redirect('/dashboard')
} 

module.exports.deleteReviewSource = async (req, res) => {
    //TODO: Add Delete confirmation
    //TODO: Add more backend functionality to confirm user before delete (mongoose middleware?)
    await Source.reviewSource.findByIdAndDelete(req.params.sourceId);
    req.flash('info', 'Your pending record has been successfully deleted.')
    res.redirect('/dashboard')
}
