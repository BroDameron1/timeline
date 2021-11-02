import { userActivityThrottler, Duplicate, StateManager, FieldManager, dialogHelper } from "./utils.js"
import autocomplete from 'autocompleter';
// import { NSerializeJson } from 'nserializejson'
import serialize from 'form-serialize-improved'
import { sourceSchema } from '../../schemas'
//import tlds from '/node_modules/@sideway/address/lib/tlds.js'



const title = document.querySelector('#title')
const mediaType = document.querySelector('#mediaType')
const warningDiv = document.querySelector('#warning')
const bookFields = document.querySelector('#book-fields')
const movieFields = document.querySelector('#movie-fields')
const tvFields = document.querySelector('#tv-fields')
const gameFields = document.querySelector('#game-fields')
const comicFields = document.querySelector('#comic-fields')

//used in later if statements to determine if the file is for a new record or an existing record
let existingSource = true
//sets the form to the current form of the page by checking the class and id
let form = document.querySelector(`#${document.querySelector('.sourceForm').id}`)
//sets the method that should be called in the backend duplicate check
let duplicateCheckType
let unloadCheck = false //flag to determine if the beforeunload event fires on submit
let sourceLocation //variable to set if we need to change the status of a public or review record

//updates the DB for a rejected record so that it doesn't publish.
const publishReject = () => {
    document.querySelector('.reject-record').addEventListener('click', async event => {
        try {
            const adminNotes = document.querySelector('#adminNotes').value
            if (!adminNotes) { //validates that admin notes have been entered.
                warningDiv.textContent = ''
                return warningDiv.textContent = 'Please leave a comment.'
            }
            const response = await fetch('/sources/data', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sourceId,
                    adminNotes,
                    state: 'rejected',
                    collection: 'ReviewSource'
                })
            })
            unloadCheck = true  //sets unload check to true so unload function doesn't run
            location.href = "/dashboard"
            return response
        } catch (err) {
            console.log('Something went wrong.', err)
        }
    })
}

//this statement determines which type path the js file is being loaded into to update the above variables
//sets variables for creating a new record
if(form.id === 'newSource') {
    existingSource = false
    duplicateCheckType = 'submitNew'
//sets variables for a user updating one of their pending updates
} else if (form.id === 'updateReviewSource') {
    duplicateCheckType = 'updateReview'
    sourceLocation = 'ReviewSource'
//sets variables for an admin publishing a record to public
} else if (form.id === 'publishSource') {
    duplicateCheckType = 'publishRecord'
    sourceLocation = 'ReviewSource'
    publishReject()
//sets variables for any user submitting an update to a public record
} else if (form.id === 'updatePublicSource') {
    duplicateCheckType = 'editPublic'
    sourceLocation = 'PublicSource'
}





//determines the current day and sets the release date calendar to have a max date of today. Also properly formats the date.
window.addEventListener('load', event => {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; //January is 0!
    const yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    } 
        
    today = yyyy + '-' + mm + '-' + dd;
    const dateFields = document.querySelectorAll('.date')
    dateFields.forEach(date => {
        date.setAttribute("max", today)
    })
})

//sets the record to checked out and then starts an idle timer that kicks out the user if the don't perform any action after the specified time (in the utils file)
if (existingSource) {
    window.addEventListener('load', async event => {
        const state = new StateManager(true, sourceId, sourceLocation)
        await state.updateState()
        // if (stateResult !== 200) {
        //     location.href="/dashboard"
        //     console.log('Something went wrong, please contact an admin.', state)
        // }
        
        userActivityThrottler()

    })


    //sets the record checkedOut flag to false if the page is left (ignored if the form is submitted due to the unloadCheck)
    //TODO: Creates a pop up confirming if a user wants to leave the page, but this interferes with the idle timer above.
    window.addEventListener('beforeunload', async event => {
        event.preventDefault()  
        if (!unloadCheck) {
            dialogHelper(event) //TODO: Add a conditional to the function to only run under certain circumstances.
            //event.returnValue = 'test' //creates a popup dialog if the user tries to leave the page.  interferes with the inactivity timer.
            const state = new StateManager(false, sourceId, sourceLocation)
            await state.updateState()
            // if (stateResult !== 200) {
            //     return console.log('Something went wrong, please contact an admin.', state)
            // }
        } else {
            return
        }
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

form.addEventListener('submit', async event => {
    event.preventDefault()

    // let formObject = NSerializeJson.serializeForm(form)
    // console.log(formObject)

    // for (let [key, value] of Object.entries(formObject)) {
    //     if (formObject[key] === '' || formObject[key] === null) {
    //         formObject[key] === undefined
    //     }
    //     //loops through any fields that are objects and changes their subvalues to undefined if empty.
    //     if (typeof formObject[key] === 'object') {
    //         for (let [subkey, subvalue] of Object.entries(formObject[key])) {
    //             if (formObject[key][subkey] === '' || formObject[key][subkey] === null) {
    //                 formObject[key][subkey] = undefined
    //             //loops through any arrays removes any empty strings and then sets the empty array to undefined.
    //             } else if (Array.isArray(formObject[key][subkey])) {
    //                 formObject[key][subkey] = formObject[key][subkey].filter(entry => entry !== '')
    //                 if (formObject[key][subkey].length === 0) {
    //                     formObject[key][subkey] = undefined
    //                 }
    //             }
    //         }
    //     }
    // }

    const data = serialize(form, { hash: true })
    console.log(data)

    const { error } = sourceSchema.validate(data, { abortEarly: false })
    if (error) {
        return console.log(error)
    }


    //sets the warningDiv to blank so errors don't pile up
    //this may need to be refactored if there are multiple warnings
    warningDiv.innerHTML = ''
    event.submitter.disabled = true //disables the submit functionality so the form can't be submitted twice.

    //checks if mediaType is default and displays a warning if so
    if (mediaType.value === 'default') {
        event.submitter.disabled = false
        return warningDiv.textContent = 'Please select a media type.'
    }

    const submittedRecord = new Duplicate(title.value, mediaType.value, sourceId, duplicateCheckType)
    const duplicateResult = await submittedRecord.validateDuplicates()
    if (!duplicateResult) {
        //sets the unload check to true so that the checkedOut flag isn't flipped because the user exited the page because of submit.
        unloadCheck = true
        return form.submit()
    }
    event.submitter.disabled = false //re-enables the submit functionality in the even that a duplicate result was found.
    warningDiv.append(duplicateResult)
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

//creates an image preview if a new image is uploaded.
sourceImage.addEventListener('change', event => {
    const imgPreview = document.querySelector('.image-preview')
    const file = document.querySelector('input[type=file]').files[0]
    const reader = new FileReader()

    reader.addEventListener('load', function () {
        imgPreview.src = reader.result
    }, false)

    if (file) {
        reader.readAsDataURL(file)
    }
    document.querySelector('.file-name').textContent = file.name
})

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

export const autocompleteListener = () => {
    const autocompleteFields = document.querySelectorAll('.autocomplete')
    autocompleteFields.forEach((autocompleteField) => {
        autocompleteField.addEventListener('focus', event => {
            autocomplete({
                input: autocompleteField,
                emtpyMsg: 'No Results',
                debounceWaitMs: 200,
                preventSubmit: true,
                disableAutoSelect: true,
                fetch: async function(text, update) {
                    let field = autocompleteField.name
                    field = field.replace('[]', '')
                    field = field.replace('[', '.')
                    field = field.replace(']', '')
            
                    const response = await fetch('/sources/data?' + new URLSearchParams({
                        field,
                        fieldValue: autocompleteField.value
                    }))
                    const autofillOptions = await response.json()
                    console.log(autofillOptions)
                    let suggestions = autofillOptions.map(option => {
                        return { 'label': option, 'value:': option}
                    })
                    update(suggestions)
                },
                onSelect: function(item) {
                    autocompleteField.value = item.label
                } 
            })
        })
    })
}

autocompleteListener()

