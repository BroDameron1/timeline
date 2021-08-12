const User = require('./models/user');
const ExpressError = require('./utils/expressError')
const { userSchema } = require('./schemas');

const isLoggedIn = async (req, res, next) => {
    //checks to see if a user is already logged in.  If so, get their info from the DB so it can be checked
    //if they are verified.  If there is no user logged in, redirect to login.
    if (!req.user) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be logged in');
        return res.redirect('/login');
    }
    const user = await User.findById(req.user._id)   
    //This checks if the user is authenticated (Passport.js) and if the user has been verified.
    //If either one is false, the user cannot access any route this middleware is attached to
    if (!req.isAuthenticated() || !user.verified) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Please verify your account.');
        return res.redirect('/register');
    }
    next();
}

const validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body);
    if (error) {
        const errorMsg = error.details.map(el => el.message).join(',')
        throw new ExpressError(errorMsg, 400)
    } else {
        next();
    }
}

const notLoggedIn = (req, res, next) => {
    if(req.user) {
        req.flash('info', 'You are already logged in.')
        return res.redirect('/dashboard');
    }
    next();
}

const isAdmin = async (req, res, next) => {
    const user = await User.findById(req.user._id)
    if (user.role !== 'admin') {
        const redirectUrl = req.session.returnTo || '/dashboard';
        //deletes returnTo from the session object
        delete req.session.returnTo;
        //send user back to the URL they came from
        req.flash('error', 'You do not have the correct permissions')
        return res.redirect(redirectUrl);
    }
    next()
}

module.exports = {
    isLoggedIn,
    validateUser,
    notLoggedIn,
    isAdmin
}