const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const sources = require('../controllers/sources');
const multer = require('multer') //adds multer to process file uploads
const { storage } = require('../utils/cloudinary')
const upload = multer({ storage }) //initialize multer and add location for file uploads
const { isLoggedIn, isAdmin, isAuthor, isCheckedOut, validateSource } = require('../middleware');


//routes for creating and submitting a new source
router.route('/new')
    .get(isLoggedIn, catchAsync(sources.renderNewSource)) //renders the record creation page
    .post(isLoggedIn, upload.single('sourceImage'), validateSource, catchAsync(sources.submitNewSource)) //handles the submission of the record into the review queue.

//routes for publishing a record from the review queue to the public database
router.route('/review/:sourceId')
    .get(isLoggedIn, isCheckedOut('ReviewSource', 'PublicSource'), catchAsync(sources.renderReviewSource))  //TODO: Add isAdmin here.  Right now public users might be able to access.  TEST THIS.  Renders the page for an admin to review the submitted record.
    .put(isLoggedIn, isAdmin, upload.single('sourceImage'), validateSource, catchAsync(sources.publishReviewSource)) //handles moving the data to the public record IF a public record already exists.  Updates the necessary parts of the review record.
    .post(isLoggedIn, isAdmin, upload.single('sourceImage'), validateSource, catchAsync(sources.publishReviewSource)) //handles moving the data to the public record IF there is no existing public record.  Updates the necessary parts of the review record.
    .delete(isLoggedIn, isAuthor('ReviewSource'), catchAsync(sources.deleteReviewSource)) //handles deleting of submissions in the review queue by the author.

//routes for editing a pending submission by the author
router.route('/review/:sourceId/edit')
    .get(isLoggedIn, isAuthor('ReviewSource'), isCheckedOut('ReviewSource', 'PublicSource'), catchAsync(sources.renderUpdateReviewSource)) //renders the form for editting a pending review.
    .put(isLoggedIn, isAuthor('ReviewSource'), upload.single('sourceImage'), validateSource, catchAsync(sources.submitUpdateReviewSource)) //handles sending the updated data in the record in the review queue.

//route for displaying and delete public records
router.route('/:slug')
     .get(catchAsync(sources.renderSource)) //renders a public source record
     .delete(isLoggedIn, isAdmin, catchAsync(sources.deletePublicSource)) //handles the deletion of a public record by an admin

//route for submitting edits to existing public records
router.route('/:slug/edit')
    .get(isLoggedIn, isCheckedOut('ReviewSource', 'PublicSource'), catchAsync(sources.renderEditSource))  //renders the form that allows for editting the public record.
    .post(isLoggedIn, upload.single('sourceImage'), validateSource, catchAsync(sources.submitEditSource))  //handles the submission of an update to a public record and posting it to the review queue.

//route for viewing a review record that has been reviewed by an admin which shows any notes
router.route('/review/:sourceId/view')
    .get(isLoggedIn, isAuthor('ReviewSource'), catchAsync(sources.renderPostReviewSource)) //renders the review record only after it has been reviewed (not a form)

module.exports = router;