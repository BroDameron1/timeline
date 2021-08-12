const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const sources = require('../controllers/sources');
const { isLoggedIn, validateUser, notLoggedIn } = require('../middleware');


router.route('/new')
    .get(isLoggedIn, sources.renderNewSource)
    .post(isLoggedIn, catchAsync(sources.newSource))

router.route('/review/:sourceId')
    .get(isLoggedIn, catchAsync(sources.renderReviewSource))


module.exports = router;