const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users');
const passport = require('passport');
const { isLoggedIn, validateUser, notLoggedIn } = require('../middleware');
const tokenHandling = require('../utils/tokenHandling');


router.route('/register')
    .get(users.renderRegister)
    .post(validateUser, catchAsync(users.register))

router.route('/login')
    .get(notLoggedIn, users.renderLogin)
    .post(passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), users.login)

router.get('/dashboard', isLoggedIn, users.renderDashboard)

router.get('/logout', users.logout)

router.route('/resetpassword')
    .get(isLoggedIn, users.renderResetPassword)
    .patch(isLoggedIn, catchAsync(users.resetPassword))


router.route('/forgotpassword')
    .get(notLoggedIn, users.renderForgotPassword)
    .post(catchAsync(users.forgotPassword))

router.get('/verify/:userId/:token', catchAsync(users.verify))

router.route('/forgotpassword/:userId/:token')
    .get(catchAsync(users.renderForgotReset))
    .patch(catchAsync(users.forgotReset))

module.exports = router;