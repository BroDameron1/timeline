const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const timeline = require('../controllers/timeline');




router.route('/')
    .get(timeline.renderMainTimeline) //renders the default timeline page

module.exports = router;