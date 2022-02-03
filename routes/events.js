const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const events = require('../controllers/events');
const multer = require('multer') //adds multer to process file uploads
const { storage } = require('../utils/cloudinary')
const upload = multer({ storage }) //initialize multer and add location for file uploads
const { isLoggedIn, isAdmin, getRequestData, validateRecord, isAuthor, checkApprovalState, isCheckedOut, cleanSubmission } = require('../middleware');

//NOTE: removed all image middleware

//routes for creating and submitting a new event
router.route('/new')
    .get(isLoggedIn, catchAsync(events.renderNewEvent)) //renders the record creation page
    .post(isLoggedIn, cleanSubmission, catchAsync(events.submitNewEvent)) //handles the submission of the record into the review queue.

//routes for publishing a record from the review queue to the public database
router.route('/review/:recordId')
    .get(isLoggedIn, isAdmin, getRequestData('ReviewEvent'), validateRecord, checkApprovalState, isCheckedOut, catchAsync(events.renderReviewEvent))  //Renders the page for an admin to review the submitted record.
    .put(isLoggedIn, isAdmin, getRequestData('ReviewEvent'), validateRecord, cleanSubmission, catchAsync(events.publishReviewEvent)) //handles moving the data to the public record IF a public record already exists.  Updates the necessary parts of the review record.
    .post(isLoggedIn, isAdmin, getRequestData('ReviewEvent'), validateRecord, cleanSubmission, catchAsync(events.publishReviewEvent)) //handles moving the data to the public record IF there is no existing public record.  Updates the necessary parts of the review record.
    .delete(isLoggedIn, getRequestData('ReviewEvent'), validateRecord, isAuthor, checkApprovalState, isCheckedOut, catchAsync(events.deleteReviewEvent)) //handles deleting of submissions in the review queue by the author.

//routes for editing a pending submission by the author
router.route('/review/:recordId/edit')
    .get(isLoggedIn, getRequestData('ReviewEvent'), validateRecord, isAuthor, checkApprovalState, isCheckedOut, catchAsync(events.renderUpdateReviewEvent)) //renders the form for editting a pending review.
    .put(isLoggedIn, getRequestData('ReviewEvent'), validateRecord, isAuthor, checkApprovalState, cleanSubmission, catchAsync(events.submitUpdateReviewEvent)) //handles sending the updated data in the record in the review queue.

//route for displaying and delete public records
router.route('/:slug')
     .get(getRequestData('PublicEvent'), validateRecord, catchAsync(events.renderEvent)) //renders a public record
     .delete(isLoggedIn, isAdmin, getRequestData('PublicEvent'), validateRecord, catchAsync(events.deletePublicEvent)) //handles the deletion of a public record by an admin

//route for submitting edits to existing public records
router.route('/:slug/edit')
    .get(isLoggedIn, getRequestData('PublicEvent'), validateRecord, isCheckedOut, catchAsync(events.renderEditEvent))  //renders the form that allows for editting the public record.
    .post(isLoggedIn, getRequestData('PublicEvent'), validateRecord, cleanSubmission, catchAsync(events.submitEditEvent))  //handles the submission of an update to a public record and posting it to the review queue.

//route for viewing a review record that has been reviewed by an admin which shows any notes
router.route('/review/:recordId/view')
    .get(isLoggedIn, getRequestData('ReviewEvent'), validateRecord, isAuthor, catchAsync(events.renderPostReviewEvent)) //renders the review record only after it has been reviewed (not a form)

module.exports = router;