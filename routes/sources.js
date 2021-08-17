const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const sources = require('../controllers/sources');
const { isLoggedIn, validateUser, notLoggedIn, isAdmin } = require('../middleware');


router.route('/new')
    .get(isLoggedIn, catchAsync(sources.renderNewSource))
    .post(isLoggedIn, catchAsync(sources.newSource))

router.route('/review/:sourceId')
    //may need to revisist if there is a way to duplicate edit functionality here.
    .get(isLoggedIn, catchAsync(sources.renderReviewSource))
    .post(isLoggedIn, isAdmin, catchAsync(sources.publishSource))
    .put(isLoggedIn, isAdmin, catchAsync(sources.publishEditSource))

router.route('/:sourceId')
    .get(catchAsync(sources.renderSource))
    .delete(isLoggedIn, isAdmin, catchAsync(sources.deletePublicSource))

router.route('/edit/:sourceId')
    .get(isLoggedIn, catchAsync(sources.renderEditSource))
    .post(isLoggedIn, catchAsync(sources.editSource))
    


module.exports = router;