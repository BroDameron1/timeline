

//Class for managing record state from the front end
export class StateManager {
    constructor(checkedOut, sourceId, targetCollection) {
        this.checkedOut = checkedOut
        this.sourceId = sourceId
        this.targetCollection = targetCollection
    }

    async updateState () {
        const checkedOutRequest = JSON.stringify({
            checkedOut: this.checkedOut,
            sourceId: this.sourceId,
            collection: this.targetCollection
        })

        // const beacon = await navigator.sendBeacon('/utils/data', checkedOutRequest)
        const beacon = await navigator.sendBeacon('/utils/stateManager', checkedOutRequest)
        if (!beacon) {
            console.log('Something went wrong.',  err)
        }
    }
}