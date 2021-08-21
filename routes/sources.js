const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const sources = require('../controllers/sources');
const { isLoggedIn, validateUser, notLoggedIn, isAdmin } = require('../middleware');

router.route('/:sourceId')
    .get(catchAsync(sources.renderSource))

router.route('/new')
    .get(isLoggedIn, catchAsync(sources.renderNewSource))
    .post(isLoggedIn, catchAsync(sources.submitNewSource))


module.exports = router;