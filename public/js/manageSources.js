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



const title = document.querySelector('#title')
const mediaType = document.querySelector('#mediaType')


//used to manage adding and removing dynamic fields
const mediaDetails = [
    {
        type: 'Book',
        field: 'book-fields',
        expandableFields: [
            {
                media: 'book',
                job: 'author',
                maxFields: 2
            }
        ]
    },
    {
        type: 'Movie',
        field: 'movie-fields',
        expandableFields: [
            {
                media: 'movie',
                job: 'director',
                maxFields: 1
            },
            {
                media: 'movie',
                job: 'writer',
                maxFields: 3
            }
        ]
    },
    {
        type: 'TV Show',
        field: 'tv-fields',
        expandableFields: []
    },
    {
        type: 'Comic',
        field: 'comic-fields',
        expandableFields: [
            {
                media: 'comic',
                job: 'artist',
                maxFields: 3
            }
        ]
    },
    {
        type: 'Video Game',
        field: 'game-fields',
        expandableFields: []
    },
]



//gets all the properties and data from the form to be used for various other functions
const formProperties = gatherFormInfo()

//turns on a prompt that pops up when the window closes.  Can be disabled with suppressLeavePrompt function where necessary
leavePrompt()

//determines the current day and sets the release date calendar to have a max date of today. Also properly formats the date.
maxDateSelector()

//creates an image preview whenever the image is changed
imagePreview()

//turns on autocomplete functionality for any associated fields with the autocomplete class.  Can't use formProperties because it always has to be the public source.
autocompleteListener('PublicSource')

//this function does multiple things.  For new records it hides or reveals the fields associated with the chosen media type.  In new and existing records it allows for the addition and removal of variable number fields as defined in the mediaDetails object.  In existing records it ensures that dynamically loaded fields saved previously load correctly.
//TODO: rebuilt this function to allow any record to use it to add/remove fields
const multiFieldManager = () => {
    for (let media of mediaDetails) { //loops through each media object in the mediaType array
        const mediaDiv = document.querySelector(`#${media.field}`) //selects the div holding all the fields for that particular media type
        if (media.type === mediaType.value) { //checks if the current media being looped through matches the current value of the form.
            mediaDiv.classList.remove('hide-sources') //displays all fields of the chosen media type
            for (let expandFieldSettings of media.expandableFields) { //loops through each field that can be expanded as defined in the mediaType array.
                if (formProperties.existingSource) { //if an existing source, runs the loadField method so the dynamic fields are properly added
                    const loadExistingFields = new FieldManager(...Object.values(expandFieldSettings))  //TODO: change how we pass through the parameters so we can remove "media" from the object.
                    loadExistingFields.loadField()
                }
                //creates the eventlisteners for the add/remove field methods and then executes those methods when clicked.
                mediaDiv.addEventListener('click', event => {
                    const fieldChange = new FieldManager(...Object.values(expandFieldSettings))
                    if (event.target && event.target.matches(`a#add-${expandFieldSettings.job}`)) {
                        fieldChange.addField(`remove-${expandFieldSettings.job}`)
                    }
                    if (event.target && event.target.matches(`a.remove-${expandFieldSettings.job}`)) {
                        fieldChange.deleteField(event.target.parentElement)
                    }
                })
            }
        } else {
            mediaDiv.classList.add('hide-sources') //hides divs for non-chosen media types.
            const allFields = mediaDiv.querySelectorAll(":scope > div > input"); //selects all inputs under non-chosen media types.
            for (let singleField of allFields) { //loops through all previously chosen inputs and sets them to their default value.  For example, this stops book records being submitted with movie data by scrubbing that data when the media type is changed.
                singleField.value = singleField.defaultValue
            }
        }
    }
}


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

    //determines which parts of the form to load based on the mediaType
    //also ensures the additionally added fields load with the "remove" option
    window.addEventListener('load', event => {
        multiFieldManager()
    })

} else {

    //on new records, loads the proper fields for the chosen mediaType
    mediaType.addEventListener('input', event => {
        multiFieldManager()
    })


}

formProperties.formData.addEventListener('submit', async event => {
    event.preventDefault()

    event.submitter.disabled = true //disables the submit functionality so the form can't be submitted twice.


    clearWarning()  //clears any previous warnings

    // validates all entries on the form to match Joi schema on the backend and generates error messages.  Saves true/false to variable on whether there was an error or not.
    const adminNote = adminNoteCheck()
    const formFail = formValidation(formProperties.formData, formProperties.schema)

    const submittedRecord = new Duplicate(formProperties.lockLocation, recordId, formProperties.duplicateCheck)
    const duplicateResult = await submittedRecord.validateDuplicates()


    if (!duplicateResult && !formFail && !adminNote) {
        //sets the unload check to true so that the checkedOut flag isn't flipped because the user exited the page because of submit.
        suppressLeavePrompt()
        return formProperties.formData.submit()
    }
    event.submitter.disabled = false //re-enables the submit functionality in the event that a duplicate result was found.
})





