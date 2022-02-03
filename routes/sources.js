const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const sources = require('../controllers/sources');
const multer = require('multer') //adds multer to process file uploads
const { storage } = require('../utils/cloudinary')
const upload = multer({ storage }) //initialize multer and add location for file uploads
const { isLoggedIn, isAdmin, getRequestData, validateRecord, isAuthor, checkApprovalState, isCheckedOut, cleanSubmission } = require('../middleware');


//routes for creating and submitting a new source
router.route('/new')
    .get(isLoggedIn, catchAsync(sources.renderNewSource)) //renders the record creation page
    .post(isLoggedIn, upload.single('sourceImage'), cleanSubmission, catchAsync(sources.submitNewSource)) //handles the submission of the record into the review queue.

//routes for publishing a record from the review queue to the public database
router.route('/review/:recordId')
    .get(isLoggedIn, isAdmin, getRequestData('ReviewSource'), validateRecord, checkApprovalState, isCheckedOut, catchAsync(sources.renderReviewSource))  //Renders the page for an admin to review the submitted record.
    .put(isLoggedIn, isAdmin, getRequestData('ReviewSource'), validateRecord, upload.single('sourceImage'), cleanSubmission, catchAsync(sources.publishReviewSource)) //handles moving the data to the public record IF a public record already exists.  Updates the necessary parts of the review record.
    .post(isLoggedIn, isAdmin, getRequestData('ReviewSource'), validateRecord, upload.single('sourceImage'), cleanSubmission, catchAsync(sources.publishReviewSource)) //handles moving the data to the public record IF there is no existing public record.  Updates the necessary parts of the review record.
    .delete(isLoggedIn, getRequestData('ReviewSource'), validateRecord, isAuthor, checkApprovalState, isCheckedOut, catchAsync(sources.deleteReviewSource)) //handles deleting of submissions in the review queue by the author.

//routes for editing a pending submission by the author
router.route('/review/:recordId/edit')
    .get(isLoggedIn, getRequestData('ReviewSource'), validateRecord, isAuthor, checkApprovalState, isCheckedOut, catchAsync(sources.renderUpdateReviewSource)) //renders the form for editting a pending review.
    .put(isLoggedIn, getRequestData('ReviewSource'), validateRecord, isAuthor, checkApprovalState, upload.single('sourceImage'),  cleanSubmission, catchAsync(sources.submitUpdateReviewSource)) //handles sending the updated data in the record in the review queue.

//route for displaying and delete public records
router.route('/:slug')
     .get(getRequestData('PublicSource'), validateRecord, catchAsync(sources.renderSource)) //renders a public source record
     .delete(isLoggedIn, isAdmin, getRequestData('PublicSource'), validateRecord, catchAsync(sources.deletePublicSource)) //handles the deletion of a public record by an admin

//route for submitting edits to existing public records
router.route('/:slug/edit')
    .get(isLoggedIn, getRequestData('PublicSource'), validateRecord, isCheckedOut, catchAsync(sources.renderEditSource))  //renders the form that allows for editting the public record.
    .post(isLoggedIn, getRequestData('PublicSource'), validateRecord, upload.single('sourceImage'), cleanSubmission, catchAsync(sources.submitEditSource))  //handles the submission of an update to a public record and posting it to the review queue.

//route for viewing a review record that has been reviewed by an admin which shows any notes
router.route('/review/:recordId/view')
    .get(isLoggedIn, getRequestData('ReviewSource'), validateRecord, isAuthor, catchAsync(sources.renderPostReviewSource)) //renders the review record only after it has been reviewed (not a form)

module.exports = router;