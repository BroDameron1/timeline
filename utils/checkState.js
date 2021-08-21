const ExpressError = require("./expressError");


const publishNewSourceValidation = (publicSourceData, reviewSourceData, admin) => {
    if (reviewSourceData.state === 'checked out' && !reviewSourceData.author[0].equals(admin)) {
        return true;
    }
    return false
}



// const badStates = ['new', 'update', 'approved', 'published', 'rejected']

// const badStates = ['checked out', 'approved', 'rejected']


module.exports = {
    publishNewSourceValidation
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