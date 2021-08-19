const ExpressError = require("./expressError");

const reviewStateCheck = (sourceData) => {
    if (sourceData.state === 'new' || sourceData.state === 'update') {
        return true;
    } else {
        return false;
    }
}

const publicStateCheck = (sourceData) => {
    if (sourceData.state === 'published') {
        return true;
    } else {
        return false;
    }
}

const checkState = (sourceData) => {
    const reviewStates = ['new', 'update', 'checked out-r', 'approved', 'rejected']
    const publicStates = ['checked out-p', 'published']

    if (reviewStates.includes(sourceData.state)) {
        return reviewStateCheck(sourceData);
    } else if (publicStates.includes(sourceData.state)) {
        return publicStateCheck(sourceData);
    } else {
        throw new ExpressError('Something has gone terribly wrong, please contact an admin.')
    }
}

const changeState = async (sourceData, state) => {
    const currentState = sourceData.state;
    if (currentState === 'new' || currentState === 'update') {
        sourceData.state = state;
        await sourceData.save();
        setTimeout(async function() {
            sourceData.state = currentState
            await sourceData.save();
        }, 10000)
    }
}

module.exports = {
    checkState,
    changeState
}


// new - review
// update - review
// checked out-r - review
// checked out-p - public
// approved - review
// rejected - review
// ['new', 'update', 'checked out-r', 'checked out-p', 'approved', 'published', 'rejected']