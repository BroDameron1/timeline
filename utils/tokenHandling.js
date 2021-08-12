const crypto = require('crypto');
const Token = require('../models/token');
const User = require('../models/user');
const ExpressError = require('./expressError');

const createHmac = async (unhashedToken) => {
    return await crypto.createHmac('sha256', process.env.VALIDATION_TOKEN)
                        .update(unhashedToken)
                        .digest('hex');
}

const createToken = async (user) => {
    let token = await Token.findOne({ userId: user._id });
    if(!token) {
        const unhashedToken = await crypto.randomBytes(32).toString('hex');
        token = await new Token({
            userId: user._id,
            token: await createHmac(unhashedToken)
        }).save();
        return `${user._id}/${unhashedToken}`;
    }
    throw new ExpressError('A request has already been made to reset your password. Please contact an admin.', 403)
}

const validateToken = async (token, userId) => {
    try {
        const tokenData = await Token.findOne({ userId: userId });
        const hashedToken = await createHmac(token);
        const user = await User.findOne({ _id: userId });
        if(hashedToken !== tokenData.token || !user) {
            return false;
        }
        return user;
    } catch (err) {
        return false;
    }
}

const tokenError = (req, res) => {
    req.flash('error', 'This verification code is invalid or expired. Please contact an admin.')
    res.redirect('/register');
}

module.exports = {
    createToken,
    validateToken,
    tokenError
}