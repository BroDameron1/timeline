const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewMaster = new Schema({
    reviewRecord: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'onModel'
    },
    onModel: {
        type: String,
        required: true,
        enum: ['ReviewSource', 'ReviewEvent' ]
    }
})

module.exports = {
    reviewMaster
}

module.exports = mongoose.model('ReviewMaster', reviewMaster);