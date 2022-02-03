

//Class for managing record state from the front end
export class StateManager {
    constructor(checkedOut, recordId, targetCollection) {
        this.checkedOut = checkedOut
        this.recordId = recordId
        this.targetCollection = targetCollection
    }

    async updateState () {
        const checkedOutRequest = JSON.stringify({
            checkedOut: this.checkedOut,
            recordId: this.recordId,
            collection: this.targetCollection
        })

        const beacon = await navigator.sendBeacon('/utils/stateManager', checkedOutRequest)
        if (!beacon) {
            console.log('Something went wrong.',  err)
        }
    }
}