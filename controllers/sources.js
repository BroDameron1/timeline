const Source = require('../models/source'); //pull in the Source database model
const { RecordHandler } = require('./record-handler-service'); //pull in the RecordHandler class

//pulls the following data from the database model: fields to check for duplicates, the name of the review database collection, the name of the public database collection, which fields have predefined choices (staticFields) and the record _id(since no record is being search here, the id is irrelevent for this request)
// const sourceRecordProps = new Source.reviewSource().recordProps
const sourceRecordProps = Source.reviewSource.schema.virtualpath('recordProps').getters[0]()


//controller for get route for rendering any existing public source
module.exports.renderSource = async (req, res) => {
    const recordHandler = new RecordHandler(req, res, sourceRecordProps, 'sources/source.ejs') //instantiates a new RecordHandler class in the record-handler-service
    const publicData = await recordHandler.dataLookup() //uses the datalookup method to get the public record
    recordHandler.renderPage(publicData) //uses the renderpage method to render the public record
}

//controller for get route for rendering a review record AFTER it has been reviewed
module.exports.renderPostReviewSource = async (req, res) => {
    const recordHandler = new RecordHandler(req, res, sourceRecordProps, 'sources/source.ejs') //instantiates a new RecordHandler class in the record-handler-service
    const reviewData = await recordHandler.dataLookup() //uses dataloopup method to get the review record
    recordHandler.renderPage(reviewData)  //uses the renderpage method to render the review record for the author after review
}

//controller for get route for rendering the New Source submission form.
module.exports.renderNewSource = async (req, res) => {
    const data = new Source.reviewSource()  //creates a new Source object from the database model so that there is an actual record that the EJS template can pull from without failing
    const recordHandler = new RecordHandler(req, res, sourceRecordProps, 'sources/newSource.ejs') //instantiates a new RecordHandler class in the record-handler-service
    recordHandler.renderPage(data, sourceRecordProps.staticFields) //uses the renderpage method to render the form to create a new record.
}

//controller for post route for handling the submission of a new record.
module.exports.submitNewSource = async (req, res) => {
    const recordHandler = new RecordHandler(req, res, sourceRecordProps) //instantiates a new RecordHandler class in the record-handler-service
    return await recordHandler.createNewRecord() //
}

//controller for the get request to render the page for an admin to review a record
module.exports.renderReviewSource = async (req, res) => {
    const recordHandler = new RecordHandler(req, res, sourceRecordProps, 'sources/publishSource.ejs') //instantiates a new RecordHandler class in the record-handler-service
    const reviewData = await recordHandler.dataLookup() //uses datalookup method to get the review record
    if (reviewData.author[0].equals(req.user._id)) { //this compares the author of the review against the admin currently reviewing it so ensure and admin isn't reviewing their own record (this is also checked in the middleware) 
        req.flash('error', "You can't approve your own article you weirdo. How did you even get here?")
        return res.redirect('/dashboard')
    }
    recordHandler.renderPage(reviewData, sourceRecordProps.staticFields) //uses the renderpage method to render the record to be reviewed
}

//controller for the put OR post request when an admin approves a record in the review queue
module.exports.publishReviewSource = async (req, res) => {
    const recordHandler = new RecordHandler(req, res, sourceRecordProps, '/sources/') //instantiates a new RecordHandler class in the record-handler-service
    await recordHandler.publishReviewRecord()  //uses the publishreviewrecord method to publish the review record to public database
}

//controller for the get request to render the form to allow a user to edit a record they have in the review queue
module.exports.renderUpdateReviewSource = async (req, res) => {
    const recordHandler = new RecordHandler(req, res, sourceRecordProps, 'sources/updateReviewSource.ejs') //instantiates a new RecordHandler class in the record-handler-service
    const reviewData = await recordHandler.dataLookup() //uses datalookup method to get the review record
    recordHandler.renderPage(reviewData, sourceRecordProps.staticFields) //uses the renderpage method to render the record to be editted
}

//controller for the put request when a user submits an update to their record that is in the review queue
module.exports.submitUpdateReviewSource = async (req, res) => {
    const recordHandler = new RecordHandler(req, res, sourceRecordProps) //instantiates a new RecordHandler class in the record-handler-service
    await recordHandler.editReviewRecord() //uses the editreviewrecord method to update the record in the review queue
}

//controller for delete request a user can make to remove their record from the review queue
module.exports.deleteReviewSource = async (req, res) => {
    const recordHandler = new RecordHandler(req, res, sourceRecordProps) //instantiates a new RecordHandler class in the record-handler-service
    recordHandler.deleteReviewRecord() //uses the deletereviewrecord method to delete the record from the review queue
}

//controller for the get request for the edit page for a public record
module.exports.renderEditSource = async (req, res) => {
    const recordHandler = new RecordHandler(req, res, sourceRecordProps, 'sources/updatePublicSource.ejs') //instantiates a new RecordHandler class in the record-handler-service
    const publicData = await recordHandler.dataLookup() //uses the datalookup method to find the record information requested
    recordHandler.renderPage(publicData, sourceRecordProps.staticFields) //uses the renderpage method to render the data previously requested
}

//controller for the post request for submitting an edit for a public record into the review queue
module.exports.submitEditSource = async (req, res) => {
    const recordHandler = new RecordHandler(req, res, sourceRecordProps, '/sources/') //instantiates a new RecordHandler class in the record-handler-service
    await recordHandler.editPublicRecord() //uses the editpublicrecord method to add the requested changes to the review queue
}

//controller for the delete request for an admin to delete an existing public record
module.exports.deletePublicSource = async (req,res) => {
    const recordHandler = new RecordHandler(req, res, sourceRecordProps) //instantiates a new RecordHandler class in the record-handler-service
    await recordHandler.deletePublicRecord() //uses the deletepublicrecordmethod to delete an existing publicrecord which can only be done by an admin
}
