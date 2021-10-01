const User = require('./models/user');
const Source = require('./models/source');
const ExpressError = require('./utils/expressError')
const { userSchema, sourceSchema } = require('./schemas');

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

const validateSource = (req, res, next) => {
    const { error } = sourceSchema.validate(req.body)
    if (error) {
        const errorMsg = error.details.map(el => el.message).join(',')
        throw new ExpressError(errorMsg, 400)
    } else {
        next();
    }
}

const validateSourceTest = (data) => {
    const { error } = sourceSchema.validate(data)
    if (error) {
        const errorMsg = error.details.map(el => el.message).join(',')
        throw new ExpressError(errorMsg, 400)
    } else {
        return true
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

const isAuthor = async (req, res, next) => {
    const { sourceId } = req.params
    const reviewSourceData = await Source.reviewSource.findById(sourceId)
    if (!reviewSourceData.author[0].equals(req.user._id)) {
        req.flash('error', "You do not have the correct permissions.")
        return res.redirect('/dashboard')
    }
    next()
}

const isCheckedOut = async (req, res, next) => {
    const { sourceId, slug } = req.params
    const reviewSourceData = await Source.reviewSource.findById(sourceId)
    const publicSourceData = await Source.publicSource.findOne({ slug })
    if ((reviewSourceData && reviewSourceData.checkedOut) || (publicSourceData && publicSourceData.checkedOut)) {
        req.flash('error', 'This record is already in use.')
        return res.redirect('/dashboard')
    }
    next()
}

module.exports = {
    isLoggedIn,
    validateUser,
    validateSource,
    validateSourceTest,
    notLoggedIn,
    isAdmin,
    isAuthor,
    isCheckedOut
}