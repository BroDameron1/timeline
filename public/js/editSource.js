import { idleLogout, Duplicate } from "./utils.js"

const title = document.querySelector('#title')
const mediaType = document.querySelector('#mediaType')
const form = document.querySelector('#editSource')
const div = document.querySelector('#warning')
const button = document.querySelector('.btn-submit')


const changeState = async (newState, sourceId) => {
    try {
        const response = await fetch('/sources/data', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                state: newState,
                sourceId
            })
        })
        return response.status
    } catch (err) {
        console.log('Something went wrong.1', err)
    }
}

window.addEventListener('load', async event => {
    const state = await changeState('checked out', sourceId)
    if (state !== 200) {
        location.href="/dashboard"
        console.log('Something went wrong, please contact an admin.', state)
    }
    setInterval(idleLogout, 1000)
})


window.addEventListener('beforeunload', async event => {
        const state = await changeState('new', sourceId)
        if (state !== 200) {
            console.log('Something went wrong, please contact an admin.', state)
        }
})

// TODO: Do an AJAX call for ID instead of passing it through EJS?

form.addEventListener('submit', async event => {
    event.preventDefault()
    const submittedRecord = new Duplicate(title.value, mediaType.value, sourceId)
    const duplicateResult = await submittedRecord.checkBothDuplicates()
    if (duplicateResult === true) {
        return form.submit()
    }
    return div.textContent = duplicateResult
})