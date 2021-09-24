const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const sources = require('../controllers/sources');
const multer = require('multer') //adds multer to process file uploads
const { storage } = require('../utils/cloudinary')
const upload = multer({ storage }) //initialize multer and add location for file uploads
const { isLoggedIn, isAdmin, isAuthor } = require('../middleware');

//routes for creating and submitting a new source
router.route('/new')
    .get(isLoggedIn, catchAsync(sources.renderNewSource))
    .post(isLoggedIn, upload.single('sourceImage'), catchAsync(sources.submitNewSource))

//routes for publishing a source to public
router.route('/review/:sourceId')
    .get(isLoggedIn, catchAsync(sources.renderReviewSource))
    .put(isLoggedIn, isAdmin, upload.single('sourceImage'), catchAsync(sources.publishReviewSource))
    .post(isLoggedIn, isAdmin, upload.single('sourceImage'), catchAsync(sources.publishReviewSource))
    .delete(isLoggedIn, isAuthor, catchAsync(sources.deleteReviewSource))

//routes for editing a pending submission
router.route('/review/:sourceId/edit')
    .get(isLoggedIn, isAuthor, catchAsync(sources.renderUpdateReviewSource))
    .put(isLoggedIn, isAuthor, upload.single('sourceImage'), catchAsync(sources.submitUpdateReviewSource))

router.route('/data')
    .get(isLoggedIn, catchAsync(sources.getData))
    .put(isLoggedIn, catchAsync(sources.putData))

// router.route('/:sourceId/:slug')
//     .get(catchAsync(sources.renderSource))

router.route('/:slug')
     .get(catchAsync(sources.renderSource))

router.route('/:slug/edit')
    .get(isLoggedIn, catchAsync(sources.renderEditSource))
    .post(isLoggedIn, upload.single('sourceImage'), catchAsync(sources.submitEditSource))

module.exports = router;