const ExpressError = require("./expressError");



module.exports = {

}



//const isEditableSubmit = ()

// new - review
// update - review
// checked out-r - review
// checked out-p - public
// approved - review
// rejected - review
// ['new', 'update', 'checked out-r', 'checked out-p', 'approved', 'published', 'rejected']

//code where change state has a timeout if a user takes too long editing the form
// const changeState = async (sourceData, state) => {
//     const currentState = sourceData.state;
//     if (currentState === 'new' || currentState === 'update') {
//         sourceData.state = state;
//         await sourceData.save();
//         setTimeout(async function() {
//             sourceData.state = currentState
//             await sourceData.save();
//         }, 10000)
//     }
// }