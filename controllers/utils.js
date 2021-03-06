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
            return res.json(await duplicateChecker.publishRecord(recordProps, recordProps.id))
        case 'editPublic': 
            return res.json(await duplicateChecker.editPublic(recordProps, recordProps.id))
    }
}

//controller that accepts data needed for autocomplete results and returns the results.
module.exports.autocomplete = async (req, res) => { 
    const { field, fieldValue, collection } = req.query //field is the field that needs autocomplete data (key), fieldValue is the current value of that field (value), collection is which collection to check.  
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
    const { recordId, collection, adminNotes, state } = req.body //pull the needed data from the request body
    console.log('did i make it')
    const reviewData = await mongoose.model(collection).findById(recordId) //find the record from the appropriate collection and ID
    Object.assign(reviewData, {adminNotes, state}) //update the record object adminnotes and state
    console.log(reviewData, 'reviewData')
    await reviewData.save()
    // return res.json(reviewData)
    return res.status(200).end()
}

//controller that allows for updating the checkedOut field between true/false
module.exports.stateManager = async (req, res) => {
    const stateParams = JSON.parse(req.body) //parse the JSON string TODO: Why do I have to do this here and not in the duplicate check controller
    const recordToToggle = await mongoose.model(stateParams.collection).findById(stateParams.recordId) //finds the record to update
    recordToToggle.checkedOut = stateParams.checkedOut //updates that record with the new boolean value
    recordToToggle.save()

}

//controller for retrieving record properties that can be passed back in for other requests (like duplicatechecking)
module.exports.getRecordProps = async (req, res) => {
    const recordProps = mongoose.model(req.query.recordType).schema.virtualpath('recordProps').getters[0]() //queries the DB model for the record properties to send back.

    return res.json(recordProps) //passes the recordprops virtual object back to the frontend as a json object
}
