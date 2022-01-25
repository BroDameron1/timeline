const mongoose = require('mongoose');
const duplicateChecker = require('../utils/duplicateChecker')

//this controller contains various endpoints for random pieces of functionality.

//controller that accepts duplicatecheck data from the frontend to validate and send back.
module.exports.duplicateCheck = async (req, res) => {
    const { recordProps, recordState } = req.body //recordProps are the data required to check for duplicates on.  recordState defines which duplicatechecker function to use.
    switch (recordState) {
        case 'submitNew': 
            return res.json(await duplicateChecker.submitNew(recordProps)) //sends data to the appropriate duplicatechecker function, waits for the results and returns the data to the front end as a json object.
        case 'updateReview': 
            return res.json(await duplicateChecker.editReview(recordProps))
        case 'publishRecord': 
            return res.json(await duplicateChecker.publishRecord(recordProps, recordProps.id)) //TODO: not sure why this requires the ID seperately.  Verify.
        case 'editPublic': 
            return res.json(await duplicateChecker.editPublic(recordProps, recordProps.id))  //TODO: not sure why this requires the ID seperately.  Verify.
    }
}

//controller that accepts data needed for autocomplete results and returns the results.
//TODO: This is receiving more than one call per key stroke.  validate.
module.exports.autocomplete = async (req, res) => { 
    const { field, fieldValue, collection } = req.query //field is the field that needs autocomplete data (key), fieldValue is the current value of that field (value), collection is which collection to check.  TODO:  See if we can avoid passing in the collection by using recordProps
    try {
        const autofillResponse = await mongoose.model(collection).aggregate(  //makes a call to the appropriate db collection
            [
                { $unwind: `$${field}`}, //takes every document with the specified field value and breaks them out into their own individual documents.  //TODO: Figure out if this is the most performant way to get this data.
                { $match: {[`${field}`]: {$regex: `^${fieldValue}`, '$options' : 'i'} }}, //queries the documents for any where the specified field matches/ the fieldvalue being passed through.  option i ignores case.
                { $group: {_id: `$${field}`}}, //returns only the field and field value specified
                { $sort: { field: 1 } } //returns the found records in alphabetical order.
            ]
        )
        const autofillArray = autofillResponse.map(option => { //since the db responsed with a key/value (_id: value) pair for the response, this creates a new array with only the values (that is all that the autocomplete library requires)
            return option._id
        })
        return res.json(autofillArray) //sends the array of potential autofill responses back to the frontend as a json object
    } catch (e) {
        console.log(e)
    }
}

//controller that allowss for updating a review record that has been rejected by an admin
module.exports.rejectPublish = async (req, res) => {
    const { sourceId, collection, adminNotes, state } = req.body //pull the needed data from the request body
    const reviewData = await mongoose.model(collection).findById(sourceId) //find the record from the appropriate collection and ID
    Object.assign(reviewData, {adminNotes, state}) //update the record object adminnotes and state
    await reviewData.save()
}

//controller that allows for updating the checkedOut field between true/false
module.exports.stateManager = async (req, res) => {
    const stateParams = JSON.parse(req.body) //parse the JSON string TODO: Why do I have to do this here and not in the duplicate check controller
    const recordToToggle = await mongoose.model(stateParams.collection).findById(stateParams.sourceId) //finds the record to update
    recordToToggle.checkedOut = stateParams.checkedOut //updates that record with the new boolean value
    recordToToggle.save()
}

//controller for retrieving record properties that can be passed back in for other requests (like duplicatechecking)
module.exports.getRecordProps = async (req, res) => {
    const recordProps = new mongoose.model(req.query.recordType)() //uses the recordtype in the query paramaters to create a db object from that model
    return res.json(recordProps.recordProps) //passes the recordprops virtual object back to the frontend as a json object
}
