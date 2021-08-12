const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const sources = require('../controllers/sources');
const { isLoggedIn, validateUser, notLoggedIn, isAdmin } = require('../middleware');


router.route('/new')
    .get(isLoggedIn, catchAsync(sources.renderCreateSource))
    .post(isLoggedIn, catchAsync(sources.createSource))

router.route('/review/:sourceId')
    .get(isLoggedIn, catchAsync(sources.renderReviewSource))
    .post(isLoggedIn, catchAsync(sources.publishSource))


module.exports = router;