const Source = require('../models/source');
const { RecordHandler } = require('./record-handler-service');

//TODO: Pull from database?
// const recordProps = {
//     review: 'ReviewSource',
//     public: 'PublicSource', 
//     duplicateCheckFields: ['title', 'mediaType'],
//     staticFields: ['mediaType']
// }

const sourceRecordProps = new Source.reviewSource().recordProps
console.log(sourceRecordProps)


// const staticFields = ['mediaType']

//controller for get route for rendering any existing source.
module.exports.renderSource = async (req, res) => {
    const recordHandler = new RecordHandler(req, res, sourceRecordProps, 'sources/source.ejs')
    const publicData = await recordHandler.dataLookup('public')
    recordHandler.renderPage(publicData)
}

//controller for rendering a review record AFTER it has been reviewed.
module.exports.renderPostReviewSource = async (req, res) => {
    const recordHandler = new RecordHandler(req, res, sourceRecordProps, 'sources/source.ejs')
    const reviewData = await recordHandler.dataLookup('review')
    recordHandler.renderPage(reviewData)
}

//controller for get route for rendering the New Source submission form.
//TODO: Get in record-handler-service some how
module.exports.renderNewSource = async (req, res) => {
    const data = new Source.reviewSource()  //not sure i should be doing this
    const recordHandler = new RecordHandler(req, res, sourceRecordProps, 'sources/newSource.ejs')
    recordHandler.renderPage(data, sourceRecordProps.staticFields)
}

//controller for the post route for submitting a New Source to be approved.
module.exports.submitNewSource = async (req, res) => {
    const recordHandler = new RecordHandler(req, res, sourceRecordProps)
    return await recordHandler.createNewRecord()
}

//renders the page for an admin to update and approve any review record
module.exports.renderReviewSource = async (req, res) => {

    const recordHandler = new RecordHandler(req, res, sourceRecordProps, 'sources/publishSource.ejs')
    const reviewData = await recordHandler.dataLookup('review')
    //TODO: Make this a middleware???
    if (reviewData.author[0].equals(req.user._id)) {
        req.flash('error', "You can't approve your own article you weirdo. How did you even get here?")
        return res.redirect('/dashboard')
    }
    if (recordHandler.checkApprovalState(reviewData)) return
    recordHandler.renderPage(reviewData, sourceRecordProps.staticFields)
}

//allows the publishing of any review record (whether a new record or an updated one)w
//TODO: SAVE THE REVIEW CHANGES AND THEN SET PUBLIC BODY TO EQUAL REVIEW BODY?!?
//currently using req.body to capture changes made by the admin.
module.exports.publishReviewSource = async (req, res) => {
    const recordHandler = new RecordHandler(req, res, sourceRecordProps, '/sources/')
    await recordHandler.publishReviewRecord()
}

//renders the page for a user to update an already submitted review record
module.exports.renderUpdateReviewSource = async (req, res) => {
    const recordHandler = new RecordHandler(req, res, sourceRecordProps, 'sources/updateReviewSource.ejs')
    const reviewData = await recordHandler.dataLookup('review')
    if (recordHandler.checkApprovalState(reviewData)) return
    recordHandler.renderPage(reviewData, sourceRecordProps.staticFields)
}

//allows submission of an update to an already submitted review record
module.exports.submitUpdateReviewSource = async (req, res) => {
    const recordHandler = new RecordHandler(req, res, sourceRecordProps)
    await recordHandler.editReviewRecord()
}

//allows a user to delete a pending submitted update
module.exports.deleteReviewSource = async (req, res) => {
    const recordHandler = new RecordHandler(req, res, sourceRecordProps)
    recordHandler.deleteReviewRecord()
}

//renders the page for update to an existing source
module.exports.renderEditSource = async (req, res) => {
    const recordHandler = new RecordHandler(req, res, sourceRecordProps, 'sources/updatePublicSource.ejs')
    const publicData = await recordHandler.dataLookup('public')
    recordHandler.renderPage(publicData, sourceRecordProps.staticFields)
}

//allows a user to submit an update for an existing source
module.exports.submitEditSource = async (req, res) => {
    const recordHandler = new RecordHandler(req, res, sourceRecordProps, '/sources/')
    await recordHandler.editPublicRecord()
}

//controller that allows an admin to delete a published source
module.exports.deletePublicSource = async (req,res) => {
    const recordHandler = new RecordHandler(req, res, sourceRecordProps)
    await recordHandler.deletePublicRecord()
}
