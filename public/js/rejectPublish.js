//script for rejecting user submitted updates.
//requires DB collection where the submitted record resides

import { clearWarning, generateWarning } from "./warning.js"
import { formValidation } from './submissionFormValidation'
import { suppressLeavePrompt } from './leavePrompt'

export const adminNoteCheck = () => {
    const adminNotes = document.querySelector('#adminNotes')
    const formType = document.querySelector("[data-formtype]")
    if (formType.dataset.formtype === "publishSubmission") {
        if (!adminNotes.value) {
            generateWarning('Please leave an admin comment.', adminNotes.id)
            return true
        }
        return false
    }
    return false
}

export const rejectPublish = (reviewCollection, formId) => {
    document.querySelector('.reject-record').addEventListener('click', async event => {
        try {
            clearWarning()
            const formData = document.querySelector(`#${formId}`)
            const formFail = formValidation(formData, 'sourceSchema')


            if (!formFail && !adminNoteCheck()) {
                const adminNotes = document.querySelector('#adminNotes').value
                const response = await fetch('/sources/data', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        sourceId,
                        adminNotes,
                        state: 'rejected',
                        collection: reviewCollection
                    })
                })
                console.log(response)
                suppressLeavePrompt()
                location.href = "/dashboard"
                return response
            }
        } catch (err) {
            console.log('Something went wrong.', err)
        }
    })
}

