const filterPendingRequests = (user, allPendingRequests) => {
    if(user.role === 'admin') return allPendingRequests
    console.log(allPendingRequests);
    console.log(user);
    const userPendingRequests = allPendingRequests.filter(pendingRequest => pendingRequest.author._id.toString() === user._id.toString());
    console.log(userPendingRequests);
    return userPendingRequests;
}

module.exports = {
    filterPendingRequests
}