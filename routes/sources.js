const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const sources = require('../controllers/sources');
const { isLoggedIn, validateUser, notLoggedIn, isAdmin } = require('../middleware');

//routes for creating and submitting a new source
router.route('/new')
    .get(isLoggedIn, catchAsync(sources.renderNewSource))
    .post(isLoggedIn, catchAsync(sources.submitNewSource))

//routes for publishing a source to public
router.route('/review/:sourceId')
    .get(isLoggedIn, catchAsync(sources.renderReviewSource))
    .put(isLoggedIn, isAdmin, catchAsync(sources.publishReviewSource))
    .post(isLoggedIn, isAdmin, catchAsync(sources.publishReviewSource))
    //.get(isLoggedIn, catchAsync(sources.renderEditNew))
    // .put(isLoggedIn, catchAsync(sources.submitEditNew))
    // .post(isLoggedIn, isAdmin, catchAsync(sources.publishNewSource))

//routes for editing a pending submission
router.route('/review/:sourceId/edit')
    .get(isLoggedIn, catchAsync(sources.renderUpdateReviewSource))
    .put(isLoggedIn, catchAsync(sources.submitUpdateReviewSource))

router.route('/data')
    .get(isLoggedIn, catchAsync(sources.getData))
    .put(isLoggedIn, catchAsync(sources.putData))

router.route('/:sourceId')
    .get(catchAsync(sources.renderSource))

router.route('/:sourceId/edit')
    .get(isLoggedIn, catchAsync(sources.renderEditSource))
    .post(isLoggedIn, catchAsync(sources.submitEditSource))
    //.put(isLoggedIn, isAdmin, catchAsync(sources.publishEditSource))

// router.route('/:sourceId/edit')
//     .get(isLoggedIn, catchAsync(sources.renderEditPublicSource))
//     .post(isLoggedIn, catchAsync(sources.submitEditPublicSource))
//     .put(isLoggedIn, isAdmin, catchAsync(sources.publishEditPublicSource))

module.exports = router;