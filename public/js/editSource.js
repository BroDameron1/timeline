import { userActivityThrottler, Duplicate, StateManager, FieldManager } from "./utils.js"

import { formValidation } from './formValidation.js'
import { adminNoteCheck } from "./rejectPublish.js"
import { clearWarning } from './warning'
import { suppressLeavePrompt, leavePrompt } from './leavePrompt'
import { gatherFormInfo } from './formIdentifier'
import { maxDateSelector } from "./calendarSet.js";
import { imagePreview } from "./imageTools.js";
import { autocompleteListener } from "./autocomplete.js"
//TODO: fix the TLDS problem
//import tlds from '/node_modules/@sideway/address/lib/tlds.js'



const title = document.querySelector('#title')
const mediaType = document.querySelector('#mediaType')
const bookFields = document.querySelector('#book-fields')
const movieFields = document.querySelector('#movie-fields')
const tvFields = document.querySelector('#tv-fields')
const gameFields = document.querySelector('#game-fields')
const comicFields = document.querySelector('#comic-fields')



//sets properties for properties that can have addable fields.
const comicArtistDetails = {
    media: 'comic',
    job: 'artist',
    addableFields: 3
}

const movieDirectorDetails = {
    media: 'movie',
    job: 'director',
    addableFields: 1
}

const movieWriterDetails = {
    media: 'movie',
    job: 'writer',
    addableFields: 3
}

const bookAuthorDetails = {
    media: 'book',
    job: 'author',
    addableFields: 3
}

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

//allows adding additional fields for book authors



//gets all the properties and data from the form to be used for various other functions
const formProperties = gatherFormInfo()

//turns on a prompt that pops up when the window closes.  Can be disabled with suppressLeavePrompt function where necessary
leavePrompt()

//determines the current day and sets the release date calendar to have a max date of today. Also properly formats the date.
maxDateSelector()

//creates an image preview whenever the image is changed
imagePreview()

//turns on autocomplete functionality for any associated fields with the autocomplete class
autocompleteListener()

// const enableFieldAdd = (currentField, field) => {
//     currentField.addEventListener('click', event => {
//         const fieldChange = new FieldManager(...Object.values(field))
//         console.log(field.job, 'here')
//         if (event.target && event.target.matches(`a#add-${field.job}`)) {
//             fieldChange.addField(`remove-${field.job}`)
//         }
//         if (event.target && event.target.matches(`a.remove-${field.job}`)) {
//             fieldChange.deleteField(event.target.parentElement)
//         }
//     })
// }

const multiFieldManager = () => {
    for (let media of mediaDetails) {
        const currentField = document.querySelector(`#${media.field}`)
        if (media.type === mediaType.value) {
            currentField.classList.remove('hide-sources')
            for (let expandFieldSettings of media.expandableFields) {
                if (formProperties.existingSource) {
                    const loadExistingFields = new FieldManager(...Object.values(expandFieldSettings))  //TODO: change how we pass through the parameters so we can remove "media" from the object.
                    loadExistingFields.loadField()
                }
                // enableFieldAdd(currentField, expandFieldSettings)
                currentField.addEventListener('click', event => {
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
            currentField.classList.add('hide-sources')
        }
    }
}


if (formProperties.existingSource) {
    
    window.addEventListener('load', async event => {
        const state = new StateManager(true, sourceId, formProperties.lockLocation)
        await state.updateState()
    })

    userActivityThrottler()

    window.addEventListener('beforeunload', async event => {
        event.preventDefault()  
        
        const state = new StateManager(false, sourceId, formProperties.lockLocation)
        await state.updateState()

    })



    //determines which parts of the form to load based on the mediaType
    //also ensures the additionally added fields load with the "remove" option
    window.addEventListener('load', event => {
        multiFieldManager()
        // for (let media of mediaDetails) {
        //     const currentField = document.querySelector(`#${media.field}`)
        //     if (media.type === mediaType.value) {
        //         currentField.classList.remove('hide-sources')
        //         for (let expandFieldSettings of media.expandableFields) {
        //             const loadExistingFields = new FieldManager(...Object.values(expandFieldSettings))  //TODO: change how we pass through the parameters so we can remove "media" from the object.
        //             loadExistingFields.loadField()
        //             enableFieldAdd(currentField, expandFieldSettings)
        //         }
        //     } else {
        //         currentField.classList.add('hide-sources')
        //     }
        // }
    })
} else {
    //on new records, loads the proper fields for the chosen mediaType
    mediaType.addEventListener('input', event => {

        multiFieldManager()
    //     for (let media of mediaDetails) {
    //         const currentField = document.querySelector(`#${media.field}`)
    //         if (media.type === mediaType.value) {
    //             currentField.classList.remove('hide-sources')
    //             for (let expandFieldSettings of media.expandableFields) {
    //                 enableFieldAdd(currentField, expandFieldSettings)
    //             }
    //         } else {
    //             currentField.classList.add('hide-sources')
    //         }
    //     }

    //     // if (mediaType.value === 'Book') {
    //     //     bookFields.classList.remove('hide-sources')
    //     // } else {
    //     //     bookFields.classList.add('hide-sources')
    //     // }
    //     // if (mediaType.value === 'Movie') {
    //     //     movieFields.classList.remove('hide-sources')
    //     // } else {
    //     //     movieFields.classList.add('hide-sources')
    //     // }
    //     // if (mediaType.value === 'TV Show') {
    //     //     tvFields.classList.remove('hide-sources')
    //     // } else {
    //     //     tvFields.classList.add('hide-sources')
    //     // }
    //     // if (mediaType.value === 'Comic') {
    //     //     comicFields.classList.remove('hide-sources')
    //     // } else {
    //     //     comicFields.classList.add('hide-sources')
    //     // }
    //     // if (mediaType.value === 'Video Game') {
    //     //     gameFields.classList.remove('hide-sources')
    //     // } else {
    //     //     gameFields.classList.add('hide-sources')
    //     // }
    })
}

formProperties.formData.addEventListener('submit', async event => {
    event.preventDefault()

    event.submitter.disabled = true //disables the submit functionality so the form can't be submitted twice.


    clearWarning()  //clears any previous warnings

    // validates all entries on the form to match Joi schema on the backend and generates error messages.  Saves true/false to variable on whether there was an error or not.
    const adminNote = adminNoteCheck()
    const formFail = formValidation(formProperties.formData, formProperties.schema)

    const submittedRecord = new Duplicate(title.value, mediaType.value, sourceId, formProperties.duplicateCheck)
    const duplicateResult = await submittedRecord.validateDuplicates()

    if (!duplicateResult && !formFail && !adminNote) {
        //sets the unload check to true so that the checkedOut flag isn't flipped because the user exited the page because of submit.
        suppressLeavePrompt()
        return formProperties.formData.submit()
    }
    event.submitter.disabled = false //re-enables the submit functionality in the event that a duplicate result was found.
})






//allows adding additional fields for movie directors and writers
// movieFields.addEventListener('click', event => {
//     const directorUpdate = new FieldManager(...Object.values(movieDirectorDetails))
//     const writerUpdate = new FieldManager(...Object.values(movieWriterDetails))
//     if (event.target && event.target.matches("a#add-director")) {
//         directorUpdate.addField()
//     }
//     if (event.target && event.target.matches("a.remove-director")) {
//         directorUpdate.deleteField(event.target.parentElement)
//     }
    
//     if (event.target && event.target.matches("a#add-writer")) {
//         writerUpdate.addField()
//     }
//     if (event.target && event.target.matches("a.remove-writer")) {
//         writerUpdate.deleteField(event.target.parentElement)
//     }
// })

// //allows adding additional fields for comic artists
// comicFields.addEventListener('click', event => {
//     const fieldUpdate = new FieldManager(...Object.values(comicArtistDetails))
//     if (event.target && event.target.matches("a#add-artist")) {
//         fieldUpdate.addField('remove-artist')
//     }
//     if (event.target && event.target.matches("a.remove-artist")) {
//         fieldUpdate.deleteField(event.target.parentElement)
//         }
// })



// bookFields.addEventListener('click', event => {
//     const fieldUpdate = new FieldManager(...Object.values(bookAuthorDetails))
//     //const fieldUpdate = new FieldManager('add-author', 'book-author', 'book[author][]', 3)
//     if (event.target && event.target.matches("a#add-author")) {
//         fieldUpdate.addField('remove-author')
//     }
//     if (event.target && event.target.matches("a.remove-author")) {
//         fieldUpdate.deleteField(event.target.parentElement)
//     }
// })

