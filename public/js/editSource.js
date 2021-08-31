import { idleLogout, Duplicate, StateManager } from "./utils.js"

const title = document.querySelector('#title')
const mediaType = document.querySelector('#mediaType')
const form = document.querySelector('#editSource')
const div = document.querySelector('#warning')
const button = document.querySelector('.btn-submit')

window.addEventListener('load', async event => {
    const state = new StateManager('checked out', sourceId, 'ReviewSource')
    const stateResult = await state.updateState()
    if (stateResult !== 200) {
        location.href="/dashboard"
        console.log('Something went wrong, please contact an admin.', state)
    }
    setInterval(idleLogout, 1000)
})

let unloadCheck = false //flag to determine if the beforeunload event fires on submit

window.addEventListener('beforeunload', async event => {
    event.preventDefault()
    const previousState = sessionStorage.getItem('previousState')
    
    if (!unloadCheck) {
        event.returnValue = 'test'
        const state = new StateManager(previousState, sourceId, 'ReviewSource')
        const stateResult = await state.updateState()
        sessionStorage.removeItem('previousState')
        if (stateResult !== 200) {
            return console.log('Something went wrong, please contact an admin.', state)
        }
    } else {
        return
    }
})

// TODO: Do an AJAX call for ID instead of passing it through EJS?

form.addEventListener('submit', async event => {
    event.preventDefault()
    const submittedRecord = new Duplicate(title.value, mediaType.value, sourceId)
    const duplicateResult = await submittedRecord.checkBothDuplicates()
    //TODO: Revisit this conditional    
    if (duplicateResult === true) {
        unloadCheck = true
        return form.submit()
    }
    return div.textContent = duplicateResult
})