const Source = require('../models/source');
const mongoose = require('mongoose');
const duplicateChecker = require('../utils/duplicateChecker')

module.exports.getData = async (req, res) => { 
    const { title, mediaType, type, sourceId } = req.query
    if (type === 'submitNew') {
        const duplicateResult = await duplicateChecker.submitNew(title, mediaType)
        return res.json(duplicateResult)
    }
    if (type === 'updateReview') {
        const duplicateResult = await duplicateChecker.updateReview(title, mediaType, sourceId)
        return res.json(duplicateResult)
    }
    if (type === 'publishRecord') {
        const duplicateResult = await duplicateChecker.publishRecord(title, mediaType, sourceId)
        return res.json(duplicateResult)
    }
    if (type === 'editPublic') {
        const duplicateResult = await duplicateChecker.editPublic(title, mediaType, sourceId)
        return res.json(duplicateResult)
    }
    
    
    const { field, fieldValue, collection } = req.query


    try {
        const autofillResponse = await mongoose.model(collection).aggregate(  //TODO: FIX
            [
                { $unwind: `$${field}`},
                { $match: {[`${field}`]: {$regex: `^${fieldValue}`, '$options' : 'i'} }},
                { $group: {_id: `$${field}`}},
                { $sort: {_id: 1 } }
            ]
        )
        const autofillArray = autofillResponse.map(option => {
            return option._id
        })
        return res.json(autofillArray)
    } catch (e) {
        console.log(e)
    }
}


//controller for put route that lets JS files update data.  Right now only for
//updating state of record
module.exports.putData = async (req, res) => {
    if (typeof req.body === 'string') {
        req.body = JSON.parse(req.body)
    }
    const { sourceId, collection } = req.body
    const dataToUpdate = await mongoose.model(collection).findById(sourceId)
    dataToUpdate.set({ ...req.body })
    await dataToUpdate.save()
    res.status(200).end()
}

module.exports.getRecordProps = async (req, res) => {
    const recordProps = new mongoose.model(req.query.recordType)()
    console.log(Object.keys(recordProps.duplicateSettings.fields), '1')
    return res.json(Object.keys(recordProps.duplicateSettings.fields))
}