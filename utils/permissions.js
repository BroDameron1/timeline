const filterPendingRequests = (user, allPendingRequests) => {
    if(user.role === 'admin') return allPendingRequests
    return allPendingRequests.filter(pendingRequest => pendingRequest.author.str === user._id.str)
}

module.exports = {
    filterPendingRequests
}