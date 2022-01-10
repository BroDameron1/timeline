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
    .get(isLoggedIn, catchAsync(sources.renderNewSource))
    .post(isLoggedIn, upload.single('sourceImage'), validateSource, catchAsync(sources.submitNewSource))

//routes for publishing a source to public
router.route('/review/:sourceId')
    .get(isLoggedIn, isCheckedOut, catchAsync(sources.renderReviewSource))  //TODO: Add isAdmin here.  Right now public users might be able to access.  TEST THIS.
    .put(isLoggedIn, isAdmin, upload.single('sourceImage'), validateSource, catchAsync(sources.publishReviewSource))
    .post(isLoggedIn, isAdmin, upload.single('sourceImage'), validateSource, catchAsync(sources.publishReviewSource))
    .delete(isLoggedIn, isAuthor('ReviewSource'), catchAsync(sources.deleteReviewSource))

//routes for editing a pending submission
router.route('/review/:sourceId/edit')
    // .get(isLoggedIn, isAuthor, isCheckedOut, catchAsync(sources.renderUpdateReviewSource))
    .get(isLoggedIn, isAuthor('ReviewSource'), isCheckedOut, catchAsync(sources.renderUpdateReviewSource))
    .put(isLoggedIn, isAuthor('ReviewSource'), upload.single('sourceImage'), validateSource, catchAsync(sources.submitUpdateReviewSource))


router.route('/:slug')
     .get(catchAsync(sources.renderSource))
     .delete(isLoggedIn, isAdmin, catchAsync(sources.deletePublicSource))

router.route('/:slug/edit')
    .get(isLoggedIn, isCheckedOut, catchAsync(sources.renderEditSource))
    .post(isLoggedIn, upload.single('sourceImage'), validateSource, catchAsync(sources.submitEditSource))

router.route('/review/:sourceId/view')
    .get(isLoggedIn, isAuthor('ReviewSource'), catchAsync(sources.renderPostReviewSource))

module.exports = router;