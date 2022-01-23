const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const utils = require('../controllers/utils')
const { isLoggedIn, isAdmin } = require('../middleware');

//routes for the utility controllers.

//route for get request to access record properties (primarily used for duplicate checking)
router.route('/recordProps')
    .get(isLoggedIn, catchAsync(utils.getRecordProps))

//route for post request to send in a duplicate information to be checked from the UI
router.route('/duplicateCheck')
    .post(isLoggedIn, catchAsync(utils.duplicateCheck))

//route for get request to get autocomplete data
router.route('/autocomplete')
    .get(isLoggedIn, catchAsync(utils.autocomplete))

//route for put request to reject pending reviews
router.route('/rejectPublish')
    .put(isLoggedIn, isAdmin, catchAsync(utils.rejectPublish))

//route for post request to toggle checkedOut flag on/off for a record
router.route('/stateManager')
    .post(isLoggedIn, catchAsync(utils.stateManager))

module.exports = router;