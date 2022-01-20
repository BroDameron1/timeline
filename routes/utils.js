const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const utils = require('../controllers/utils')
const multer = require('multer') //adds multer to process file uploads
const { storage } = require('../utils/cloudinary')
const upload = multer({ storage }) //initialize multer and add location for file uploads
const { isLoggedIn } = require('../middleware');

//TODO: Add more route endpoints and controllers to be more specific to the data they are going to handle.

router.route('/data')
    .get(isLoggedIn, catchAsync(utils.getData))
    .put(isLoggedIn, catchAsync(utils.putData))
    .post(isLoggedIn, catchAsync(utils.putData))

router.route('/recordProps')
    .get(isLoggedIn, catchAsync(utils.getRecordProps))

router.route('/duplicateCheck')
    .post(isLoggedIn, catchAsync(utils.duplicateCheck))


module.exports = router;