const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const sources = require('../controllers/sources');
const { isLoggedIn, validateUser, notLoggedIn } = require('../middleware');


router.route('/new')
    .get(isLoggedIn, sources.renderNewSource)
    .post(isLoggedIn, catchAsync(sources.newSource))



module.exports = router;