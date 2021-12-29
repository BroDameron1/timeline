//script for rejecting user submitted updates.
//requires DB collection where the submitted record resides

import { clearWarning, generateWarning } from "./warning.js"
import { formValidation } from './formValidation'
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

export const rejectPublish = (formProperties) => {
    document.querySelector('.reject-record').addEventListener('click', async event => {
        try {
            clearWarning()
            const formFail = formValidation(formProperties.formData, formProperties.schema)

            if (!formFail && !adminNoteCheck()) {
                const response = await fetch('/sources/data', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        sourceId,
                        adminNotes: formProperties.formData.adminNotes.value,
                        state: 'rejected',
                        collection: formProperties.lockLocation
                    })
                })
                suppressLeavePrompt()
                location.href = "/dashboard"
                return response
            }
        } catch (err) {
            console.log('Something went wrong.', err)
        }
    })
}

