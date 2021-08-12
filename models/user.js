const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const ExpressError = require('../utils/expressError');


const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        min: 5,
        max: 10,
        unique: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    role: {
        type: String,
        default: 'basic',
        enum: ['basic', 'admin'],
        required: true
    },
    verificationExpires: {
        type: Date,
        default: () => new Date(+new Date() + 24 * 60 * 60 * 1000)
    },
    verificationToken: {
        type: String
    },
    verified: {
        type: Boolean,
        default: false,
        required: true
    }

});

//validate email is not a duplicate and pass a custom error
//TODO: Fix custom error.  Flash message?
UserSchema.path('email').validate(async (value) => {
    const emailCount = await mongoose.models.User.countDocuments({ email: value });
    return !emailCount;
  }, new ExpressError('emaillllll'));

//passport-local-mongoose password validation function that returns an error if it doesn't meet the regex
//works during registration and password reset
const passwordValidator = (password, cb) => {
    const regEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,32}$)/;
    if (!password.match(regEx)) {
      return cb('Your password does not meet the requirements, please try again.')
    }
    // return an empty cb() on success
    return cb()
  }

//adds username/password functionality to the User Schema
UserSchema.plugin(passportLocalMongoose, {
    errorMessages: {
        IncorrectPasswordError: 'Username or password is incorrect.',
        IncorrectUsernameError: 'Username or password is incorrect.'
    },
    passwordValidator: passwordValidator
});

module.exports = mongoose.model('User', UserSchema);