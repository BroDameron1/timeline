const filterPendingRequests = (user, allPendingRequests) => {
    if(user.role === 'admin') {
        const adminPendingRequests = allPendingRequests.filter(pendingRequest => pendingRequest.reviewRecord.state === 'new' || pendingRequest.reviewRecord.state === 'update' || pendingRequest.reviewRecord.author[0]._id.equals(user._id))
        return adminPendingRequests
    }
    const userPendingRequests = allPendingRequests.filter(pendingRequest => pendingRequest.reviewRecord.author[0]._id.equals(user._id));
    return userPendingRequests;
}

module.exports = {
    filterPendingRequests
}