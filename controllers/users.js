const User = require('../models/user');
const Token = require('../models/token')
const passportLocalMongoose = require('passport-local-mongoose');
//require the sendMail util to send validation email.
const sendMail = require('../utils/sendMail');
const tokenHandling = require('../utils/tokenHandling');
const ExpressError = require('../utils/expressError');
const Source = require('../models/source');

module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}

//registers a user using passport-local-mongoose by sending the data to the User schema which validates the information
//sends user to an error screen if any requirements aren't met.
module.exports.register = async (req, res, next) => {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const verifyLink = await tokenHandling.createToken(user);
    const registeredUser = await User.register(user, password, err => {
        if (err) return next (err);
        sendMail.sendVerifyMail(email, verifyLink);
        req.flash('info', 'Please check your email to verify your account.');
        res.redirect('/login');
    })

}

//validates the registration token via the tokenHandling util.  Errors if the token is expired or doesn't exist or 
//if the user doesn't exist. Updates verified status for user to true.
module.exports.verify = async (req, res) => {
    const { token, userId } = req.params;
    const userCheck = await tokenHandling.validateToken(token, userId);
    if(!userCheck) {
        return tokenHandling.tokenError(req, res);
    }
    userCheck.verified = true;
    await Token.deleteOne({ userId: userId });
    await userCheck.save();
    req.flash('info', 'Your account has been successfully verified! Please login.')
    res.redirect('/login');
}

//renders user login page
module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

//handles user login request and redirects to registration screen
module.exports.login = (req, res) => {
    //set a variable with the redirect URL stored in the session (if there is one)
    const redirectUrl = req.session.returnTo || '/dashboard';
    //deletes returnTo from the session object
    delete req.session.returnTo;
    //send user back to the URL they came from
    res.redirect(redirectUrl);
}

//renders the reset password screen which only logged in/verified users can access.
module.exports.renderResetPassword = (req, res) => {
    res.render('users/resetpassword');
}

//handles the password reset request
module.exports.resetPassword = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    await user.changePassword(oldPassword, newPassword, err => {
        if (err) return next(err);
        res.redirect('/register');
    });
    
}

//renders the forgot password page which anyone can access
module.exports.renderForgotPassword = (req, res) => {
    res.render('users/forgotpassword');
}

//handles the forgot password request.  Verifies the user exists and their email and user name are in
//the same document.  Creates a reset token and emails it to the user.
module.exports.forgotPassword = async (req, res, next) => {
    const { username, email } = req.body;
    const user = await User.findOne({ email: email, username: username })
    if (!user) {
        req.flash('error', 'User credentials do not match or do not exist');
        return res.redirect('/forgotpassword')
    }
    const verifyLink = await tokenHandling.createToken(user);
    await sendMail.sendResetMail(user.email, verifyLink);
    req.flash('info', 'Please check your email for further instructions to reset your password.');
    res.redirect('/login');
}

//renders the new password screen for a forgotten password request when the URL is clicked in the email.
//verifies the user and token are valid via the tokenHandling util before rendering.
module.exports.renderForgotReset = async (req, res) => {
    const { token, userId } = req.params;
    const tokenCheck = await tokenHandling.validateToken(token, userId);
    if(!tokenCheck) {
        return tokenHandling.tokenError(req, res);
    }
    res.render('users/forgotreset', { userId, token })
}

//handles the new password request once submitted.  Once again validates the token via the tokenHandling util.
//Sets the new password and deletes the token so it cannot be reused.
module.exports.forgotReset = async (req, res, next) => {
    const { token, userId } = req.params;
    const password = req.body.newPassword;
    const userCheck = await tokenHandling.validateToken(token, userId);
    if(!userCheck) {
        return tokenHandling.tokenError(req, res);
    }
    await userCheck.setPassword(password, async (err) => {
        if (err) return next(err);
        await Token.deleteOne({ userId: userId });
        await userCheck.save();
        req.flash('info', 'Your password has been successfully reset.')
        res.redirect('/login');
    })
}

module.exports.renderDashboard = async (req, res) => {
    const userSources = await Source.find({ author: req.user._id });
    console.log(userSources);
    res.render('users/dashboard', { userSources })
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('info', 'You have been logged out.');
    res.redirect('/login');
}