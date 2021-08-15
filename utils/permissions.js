const filterPendingRequests = (user, allPendingRequests) => {
    if(user.role === 'admin') {
        const adminPendingRequests = allPendingRequests.filter(pendingRequest => pendingRequest.state === 'new' || pendingRequest.state === 'review')
        console.log(adminPendingRequests)
        return adminPendingRequests
    }
    const userPendingRequests = allPendingRequests.filter(pendingRequest => pendingRequest.author[0]._id.toString() === user._id.toString());
    return userPendingRequests;
}

module.exports = {
    filterPendingRequests
}