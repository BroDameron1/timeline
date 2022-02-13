const User = require('./models/user');
const ExpressError = require('./utils/expressError')
const { userSchema, sourceSchema, eventSchema } = require('./schemas');
const mongoose = require('mongoose');
const ObjectID = require('mongoose').Types.ObjectId;
const { required } = require('joi');

//TODO: Should I check if something is checkedOut (true) before making put/post requests

const isLoggedIn = async (req, res, next) => {
    //checks to see if a user is already logged in.  If so, get their info from the DB so it can be checked
    //if they are verified.  If there is no user logged in, redirect to login.
    if (!req.user) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be logged in');
        return res.redirect('/login');
    }
    //This checks if the user is authenticated (Passport.js) and if the user has been verified.
    //If either one is false, the user cannot access any route this middleware is attached to

    if (!req.isAuthenticated() || !req.user.verified) {
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

const cleanSubmission = (req, res, next) => {
    console.log(req.baseUrl, 'is it here')
    //checks the req.body object for any empty fields and changes them to undefined so they don't get stored.
    for (let [key, value] of Object.entries(req.body)) {
        if (req.body[key] === '' || req.body[key] === null) {
            req.body[key] === undefined
        }
        //loops through any fields that are objects and changes their subvalues to undefined if empty.
        if (typeof req.body[key] === 'object') {
            for (let [subkey, subvalue] of Object.entries(req.body[key])) {
                if (req.body[key][subkey] === '' || req.body[key][subkey] === null) {
                    req.body[key][subkey] = undefined
                //loops through any arrays removes any empty strings and then sets the empty array to undefined.
                } else if (Array.isArray(req.body[key][subkey])) {
                    req.body[key][subkey] = req.body[key][subkey].filter(entry => entry !== '')
                    if (req.body[key][subkey].length === 0) {
                        req.body[key][subkey] = undefined
                    }
                }
            }
        }
    }

    //valites the now altered req.body against the Joi schema definitions.
    //TODO: This is a problem since it only checks against the sourceSchema.  Fix after fixing event body issue
    // const { error } = sourceSchema.validate(req.body)
    // if (error) {
    //     const errorMsg = error.details.map(el => el.message).join(',')
    //     throw new ExpressError(errorMsg, 400)
    // } else {
    //     next();
    // }
    next()
}


const notLoggedIn = (req, res, next) => {
    if(req.user) {
        req.flash('info', 'You are already logged in.')
        return res.redirect('/dashboard');
    }
    next();
}

const isAdmin = async (req, res, next) => {
    // const user = await User.findById(req.user._id)
    if (req.user.role !== 'admin') {
        const redirectUrl = req.session.returnTo || '/dashboard';
        //deletes returnTo from the session object
        delete req.session.returnTo;
        //send user back to the URL they came from
        req.flash('error', 'You do not have the correct permissions')
        return res.redirect(redirectUrl);
    }
    next()
}

const getRequestData = (targetCollection) => {
    return async (req, res, next) => {
        const { slug, recordId } = req.params
        if (recordId) {   
            if (!ObjectID.isValid(recordId)) {
                req.flash('error', 'This record does not exist.')
                return res.redirect('/dashboard')
            }
            res.locals.requestData = await mongoose.model(targetCollection).findById(recordId)
        }
        if (slug) {
            res.locals.requestData = await mongoose.model(targetCollection).findOne({ slug })
        }
        next()
    }
}

const validateRecord = async (req, res, next) => {
    if (!res.locals.requestData) {
        req.flash('error', 'This record does not exist.')
        return res.redirect('/dashboard')
    }
    next()
}

const isAuthor = (req, res, next) => {
    if (!res.locals.requestData.author[0].equals(req.user._id)) {
        req.flash('error', "You do not have the correct permissions.")
        return res.redirect('/dashboard')
    }
    next()
}

const checkApprovalState = (req, res, next) => {
    if (res.locals.requestData.state === 'approved' || res.locals.requestData.state === 'rejected') { //checks if the reviewdata is in the approved or rejected state
        req.flash('error', 'This record is not eligible to be editted or deleted.') //if so, errors out the form
        return res.redirect('/dashboard')
    }
    next()
}

const isCheckedOut = (req, res, next) => {
    if (res.locals.requestData.checkedOut) {
        req.flash('error', 'This record is already in use.')
        return res.redirect('/dashboard')
    }
    next()
}

module.exports = {
    isLoggedIn,
    validateUser,
    notLoggedIn,
    isAdmin,
    getRequestData,
    validateRecord,
    isAuthor,
    checkApprovalState,
    isCheckedOut,
    cleanSubmission
}