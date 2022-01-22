const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const utils = require('../controllers/utils')
const multer = require('multer') //adds multer to process file uploads
const { storage } = require('../utils/cloudinary')
const upload = multer({ storage }) //initialize multer and add location for file uploads
const { isLoggedIn, isAdmin } = require('../middleware');

// router.route('/data')
//     .get(isLoggedIn, catchAsync(utils.getData))
//     .put(isLoggedIn, catchAsync(utils.putData))
//     .post(isLoggedIn, catchAsync(utils.putData))

router.route('/recordProps')
    .get(isLoggedIn, catchAsync(utils.getRecordProps))

router.route('/duplicateCheck')
    .post(isLoggedIn, catchAsync(utils.duplicateCheck))

router.route('/autocomplete')
    .get(isLoggedIn, catchAsync(utils.autocomplete))

router.route('/rejectPublish')
    .put(isLoggedIn, isAdmin, catchAsync(utils.rejectPublish))

router.route('/stateManager')
    .post(isLoggedIn, catchAsync(utils.stateManager))

module.exports = router;