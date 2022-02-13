import { FieldManager } from "./utils/fieldManager.js"
import { formTimeout } from "./utils/timeout.js"
import { Duplicate } from './utils/duplicateChecker'
import { StateManager } from './utils/stateManager'
import { formValidation } from './utils/formValidation.js'
import { adminNoteCheck } from "./utils/rejectPublish.js"
import { clearWarning } from './utils/warning'
import { suppressLeavePrompt, leavePrompt } from './utils/leavePrompt'
import { gatherFormInfo } from './utils/formIdentifier'
import { maxDateSelector } from "./utils/calendarSet.js";
import { imagePreview } from "./utils/imageTools.js";
import { autocompleteListener } from "./utils/autocomplete.js"
//TODO: fix the TLDS problem
//import tlds from '/node_modules/@sideway/address/lib/tlds.js'


//gets all the properties and data from the form to be used for various other functions
const formProperties = gatherFormInfo()

//turns on a prompt that pops up when the window closes.  Can be disabled with suppressLeavePrompt function where necessary
leavePrompt()


//creates an image preview whenever the image is changed.  Currently turned off since there is no image field for events.
// imagePreview()

//turns on autocomplete functionality for any associated fields with the autocomplete class.  Can't use formProperties because it always has to be the public source.
autocompleteListener('PublicEvent')


if (formProperties.existingSource) { //for non-new records only.
    
    //updates the record to being locked on load.  recordId is pulled from the HTML.
    window.addEventListener('load', async event => {
        const state = new StateManager(true, recordId, formProperties.lockLocation)
        await state.updateState()
    })

    
    //starts the inactivity timer.
    formTimeout()

    //unlocks the record if a user leaves the edit page or the page times out.
    window.addEventListener('beforeunload', async event => {
        event.preventDefault()  
        
        const state = new StateManager(false, recordId, formProperties.lockLocation)
        await state.updateState()
    })
}

formProperties.formData.addEventListener('submit', async event => {
    event.preventDefault()

    event.submitter.disabled = true //disables the submit functionality so the form can't be submitted twice.


    clearWarning()  //clears any previous warnings

    // validates all entries on the form to match Joi schema on the backend and generates error messages.  Saves true/false to variable on whether there was an error or not.
    const adminNote = adminNoteCheck()
    const formFail = formValidation(formProperties.formData, formProperties.schema)

    //
    const submittedRecord = new Duplicate(formProperties.lockLocation, recordId, formProperties.duplicateCheck)
    const duplicateResult = await submittedRecord.validateDuplicates()


    if (!duplicateResult && !formFail && !adminNote) {
        //sets the unload check to true so that the checkedOut flag isn't flipped because the user exited the page because of submit.
        suppressLeavePrompt()
        return formProperties.formData.submit()
    }
    event.submitter.disabled = false //re-enables the submit functionality in the event that a duplicate result was found.
})





