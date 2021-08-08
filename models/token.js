const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Database collection for tokens for registration and forgotton password requests
//Pulls in User information
const TokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    token: {
        type: String,
        required: true
    },
    expireAt: {
        type: Date,
        default: Date.now,
        index: { expires: '24h'}
    }
});

module.exports = mongoose.model('Token', TokenSchema);