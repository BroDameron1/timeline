const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const sources = require('../controllers/sources');
const multer = require('multer') //adds multer to process file uploads
const { storage } = require('../utils/cloudinary')
const upload = multer({ storage }) //initialize multer and add location for file uploads
const { isLoggedIn, isAdmin, isAuthor, isCheckedOut, validateSource } = require('../middleware');

//TODO: Add more route endpoints and controllers to be more specific to the data they are going to handle.

router.route('/data')
    .get(isLoggedIn, catchAsync(sources.getData))
    .put(isLoggedIn, catchAsync(sources.putData))
    .post(isLoggedIn, catchAsync(sources.putData))

module.exports = router;