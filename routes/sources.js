const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const sources = require('../controllers/sources');
const { isLoggedIn, validateUser, notLoggedIn, isAdmin } = require('../middleware');

router.route('/new')
    .get(isLoggedIn, catchAsync(sources.renderNewSource))
    .post(isLoggedIn, catchAsync(sources.submitNewSource))

router.route('/review/:sourceId/edit')
    .get(isLoggedIn, catchAsync(sources.renderEditNew))
    .put(isLoggedIn, catchAsync(sources.submitEditNew))
    .post(isLoggedIn, isAdmin, catchAsync(sources.publishNewSource))

router.route('/data')
    .get(isLoggedIn, catchAsync(sources.getData))
    .put(isLoggedIn, catchAsync(sources.putData))

router.route('/:sourceId')
    .get(catchAsync(sources.renderSource))

router.route('/:sourceId/edit')
    .get(isLoggedIn, catchAsync(sources.renderEditPublicSource))
    .post(isLoggedIn, catchAsync(sources.submitEditPublicSource))

module.exports = router;