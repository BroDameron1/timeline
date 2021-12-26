import { userActivityThrottler, Duplicate, StateManager, FieldManager } from "./utils.js"

import { formValidation } from './submissionFormValidation.js'
import { adminNoteCheck } from "./rejectPublish.js"
import { clearWarning } from './warning'
import { suppressLeavePrompt, leavePrompt } from './leavePrompt'
import { gatherFormInfo } from './formIdentifier'
import { maxDateSelector } from "./calendarSet.js";
import { imagePreview } from "./imageTools.js";
//TODO: fix the TLDS problem
//import tlds from '/node_modules/@sideway/address/lib/tlds.js'



const title = document.querySelector('#title')
const mediaType = document.querySelector('#mediaType')
const bookFields = document.querySelector('#book-fields')
const movieFields = document.querySelector('#movie-fields')
const tvFields = document.querySelector('#tv-fields')
const gameFields = document.querySelector('#game-fields')
const comicFields = document.querySelector('#comic-fields')




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
        
        if (mediaType.value === 'Book') {
            const fieldUpdate = new FieldManager(...Object.values(bookAuthorDetails))
            fieldUpdate.loadField()
            bookFields.classList.remove('hide-sources')
        } else {
            bookFields.classList.add('hide-sources')
        }
        if (mediaType.value === 'Movie') {
            const directorUpdate = new FieldManager(...Object.values(movieDirectorDetails))
            const writerUpdate = new FieldManager(...Object.values(movieWriterDetails))
            directorUpdate.loadField()
            writerUpdate.loadField()
            movieFields.classList.remove('hide-sources')
        } else {
            movieFields.classList.add('hide-sources')
        }
        if (mediaType.value === 'TV Show') {
            tvFields.classList.remove('hide-sources')
        } else {
            tvFields.classList.add('hide-sources')
        }
        if (mediaType.value === 'Comic') {
            const fieldUpdate = new FieldManager(...Object.values(comicArtistDetails))
            fieldUpdate.loadField()
            comicFields.classList.remove('hide-sources')
        } else {
            comicFields.classList.add('hide-sources')
        }
        if (mediaType.value === 'Video Game') {
            gameFields.classList.remove('hide-sources')
        } else {
            gameFields.classList.add('hide-sources')
        }
    })
} else {
    //on new records, loads the proper fields for the chosen mediaType
    mediaType.addEventListener('input', event => {
        //event.preventDefault()
        if (mediaType.value === 'Book') {
            bookFields.classList.remove('hide-sources')
        } else {
            bookFields.classList.add('hide-sources')
        }
        if (mediaType.value === 'Movie') {
            movieFields.classList.remove('hide-sources')
        } else {
            movieFields.classList.add('hide-sources')
        }
        if (mediaType.value === 'TV Show') {
            tvFields.classList.remove('hide-sources')
        } else {
            tvFields.classList.add('hide-sources')
        }
        if (mediaType.value === 'Comic') {
            comicFields.classList.remove('hide-sources')
        } else {
            comicFields.classList.add('hide-sources')
        }
        if (mediaType.value === 'Video Game') {
            gameFields.classList.remove('hide-sources')
        } else {
            gameFields.classList.add('hide-sources')
        }

        // let selects = document.getElementsByTagName('select');
        // console.log(selects.length)
    })
}

formProperties.formData.addEventListener('submit', async event => {
    event.preventDefault()

    event.submitter.disabled = true //disables the submit functionality so the form can't be submitted twice.


    //sets the warningDiv to blank so errors don't pile up
    //this may need to be refactored if there are multiple warnings
    // warningDiv.innerHTML = ''
    
    //clears all red borders around all input types
    // document.querySelectorAll('input, select, textarea').forEach((element) => {
    //     element.style.border = ''
    // })




    // const data = serialize(form, { hash: true })
    // console.log(data, 'test1')
    // const { error } = sourceSchema.validate(data, { abortEarly: false })
    // if (error) {
    //     for (let errorDetails of error.details) {
    //         let invalidFieldName = errorDetails.path
    //         if (invalidFieldName.length === 2) {
    //             invalidFieldName = `${invalidFieldName[0]}-${invalidFieldName[1]}`
    //         } else if (invalidFieldName.length === 3) {
    //             //TODO: Add zero to field names in HTML so if statement can be removed

    //             invalidFieldName = `${invalidFieldName[0]}-${invalidFieldName[1]}${invalidFieldName[2]}`


    //             // if (invalidFieldName[2] === 0) {
    //             //     invalidFieldName = `${invalidFieldName[0]}-${invalidFieldName[1]}`
    //             // } else {
    //             //     invalidFieldName = `${invalidFieldName[0]}-${invalidFieldName[1]}${invalidFieldName[2]}`
    //             // }
    //         }
            
    //         console.log(invalidFieldName, 'invalid field')
    //         let validationWarning = document.createElement('div')
    //         validationWarning.textContent = errorDetails.message
    //         validationWarning.setAttribute('class', 'field-requirements field-invalid')
    //         document.querySelector(`#${invalidFieldName}`).style.border = 'rgb(196, 63, 63) solid 2px'
    //         warningDiv.append(validationWarning)
    //     }
    //     return
    // }

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


//allows adding additional fields for movie directors and writers
movieFields.addEventListener('click', event => {
    const directorUpdate = new FieldManager(...Object.values(movieDirectorDetails))
    const writerUpdate = new FieldManager(...Object.values(movieWriterDetails))
    if (event.target && event.target.matches("a#add-director")) {
        directorUpdate.addField()
    }
    if (event.target && event.target.matches("a.remove-director")) {
        directorUpdate.deleteField(event.target.parentElement)
    }
    
    if (event.target && event.target.matches("a#add-writer")) {
        writerUpdate.addField()
    }
    if (event.target && event.target.matches("a.remove-writer")) {
        writerUpdate.deleteField(event.target.parentElement)
    }
})

//allows adding additional fields for comic artists
comicFields.addEventListener('click', event => {
    const fieldUpdate = new FieldManager(...Object.values(comicArtistDetails))
    if (event.target && event.target.matches("a#add-artist")) {
        fieldUpdate.addField('remove-artist')
    }
    if (event.target && event.target.matches("a.remove-artist")) {
        fieldUpdate.deleteField(event.target.parentElement)
        }
})

//allows adding additional fields for book authors
bookFields.addEventListener('click', event => {
    const fieldUpdate = new FieldManager(...Object.values(bookAuthorDetails))
    //const fieldUpdate = new FieldManager('add-author', 'book-author', 'book[author][]', 3)
    if (event.target && event.target.matches("a#add-author")) {
        fieldUpdate.addField('remove-author')
    }
    if (event.target && event.target.matches("a.remove-author")) {
        fieldUpdate.deleteField(event.target.parentElement)
    }
})


//autocomplete bundle test

// export const autocompleteListener = () => {
//     const autocompleteFields = document.querySelectorAll('.autocomplete')
//     autocompleteFields.forEach((autocompleteField) => {
//         autocompleteField.addEventListener('focus', event => {
//             autocomplete({
//                 input: autocompleteField,
//                 emtpyMsg: 'No Results',
//                 debounceWaitMs: 200,
//                 preventSubmit: true,
//                 disableAutoSelect: true,
//                 fetch: async function(text, update) {
//                     let field = autocompleteField.name
//                     field = field.replace('[]', '')
//                     field = field.replace('[', '.')
//                     field = field.replace(']', '')
            
//                     const response = await fetch('/sources/data?' + new URLSearchParams({
//                         field,
//                         fieldValue: autocompleteField.value
//                     }))
//                     const autofillOptions = await response.json()
//                     console.log(autofillOptions)
//                     let suggestions = autofillOptions.map(option => {
//                         return { 'label': option, 'value:': option}
//                     })
//                     update(suggestions)
//                 },
//                 onSelect: function(item) {
//                     autocompleteField.value = item.label
//                 } 
//             })
//         })
//     })
// }



