const filterPendingRequests = (user, allPendingRequests) => {
    if(user.role === 'admin') {
        const adminPendingRequests = allPendingRequests.filter(pendingRequest => pendingRequest.state === 'new' || pendingRequest.state === 'update' || pendingRequest.author[0]._id.equals(user._id))
        return adminPendingRequests
    }
    const userPendingRequests = allPendingRequests.filter(pendingRequest => pendingRequest.author[0]._id.equals(user._id));
    return userPendingRequests;
}

module.exports = {
    filterPendingRequests
}