import { idleLogout, Duplicate, StateManager, FieldManager } from "./utils.js"

const title = document.querySelector('#title')
const mediaType = document.querySelector('#mediaType')
const div = document.querySelector('#warning')
const bookFields = document.querySelector('#book-fields')
const movieFields = document.querySelector('#movie-fields')
const tvFields = document.querySelector('#tv-fields')
const gameFields = document.querySelector('#game-fields')
const comicFields = document.querySelector('#comic-fields')


//determines current path
const currentPath = document.location.pathname
//used in later if statements to determine if the file is for a new record or an existing record
let existingSource = true
//allows changing of the form id
let form = document.querySelector('#editSource')
//sets the method that should be called in the backend duplicate check
let duplicateCheckType
let unloadCheck = false //flag to determine if the beforeunload event fires on submit
let sourceLocation //variable to set if we need to change the status of a public or review record

//this statement determines which type path the js file is being loaded into to update the above variables
//the first conditional is for an admin publishing a review record to public
if (currentPath.indexOf('review') > -1 && currentPath.indexOf('edit') === -1) {
    duplicateCheckType = 'publishRecord'
    sourceLocation = 'ReviewSource'
    console.log('publish')
//this conditional is for a user updating one of their pending review records
} else if (currentPath.indexOf('review') > -1 && currentPath.indexOf('edit') > -1) {
    duplicateCheckType = 'updateReview'
    sourceLocation = 'ReviewSource'
//this conditional is for submitting a new record
} else if (currentPath.indexOf('new') > -1) {
    existingSource = false
    form = document.querySelector('#newSource')
    duplicateCheckType = 'submitNew'
//this conditional is for edding a public record
} else if (currentPath.indexOf('review') === -1 && currentPath.indexOf('edit') > -1) {
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
        const stateResult = await state.updateState()
        if (stateResult !== 200) {
            location.href="/dashboard"
            console.log('Something went wrong, please contact an admin.', state)
        }
        setInterval(idleLogout, 1000)
    })

    

    //sets the record checkedOut flag to false if the page is left (ignored if the form is submitted due to the unloadCheck)
    //TODO: Creates a pop up confirming if a user wants to leave the page, but this interferes with the idle timer above.
    window.addEventListener('beforeunload', async event => {
        event.preventDefault()  
        if (!unloadCheck) {
            event.returnValue = 'test'
            const state = new StateManager(false, sourceId, sourceLocation)
            const stateResult = await state.updateState()
            if (stateResult !== 200) {
                return console.log('Something went wrong, please contact an admin.', state)
            }
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
        event.preventDefault()
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
    })
}

//old code that sets blank fields to disabled which has been solved in the backend and also checks for duplicate entries.
form.addEventListener('submit', async event => {
    event.preventDefault()

    //sets all fields with  no data to disabled so they do not pass in empty strings
    //fixed on the backend, delete later if this doesn't break anything
    // const inputs = document.querySelectorAll("input")
    // inputs.forEach((input) => {
    //     if (input.value.length === 0) {
    //         input.setAttribute('disabled', 'disabled')
    //     }
    // })

    const submittedRecord = new Duplicate(title.value, mediaType.value, sourceId, duplicateCheckType)
    const duplicateResult = await submittedRecord.validateDuplicates()
    //TODO: Revisit this conditional    
    if (!duplicateResult) {
        unloadCheck = true
        return form.submit()
    }
    return div.textContent = duplicateResult
})

//determines which parts of the form to load based on the mediaType
//also ensures the additionally added fields load with the "remove" option

// if (existingSource) {
//     window.addEventListener('load', event => {
//         if (mediaType.value === 'Book') {
//             const fieldUpdate = new FieldManagerTwo(...Object.values(bookAuthorDetails))
//             fieldUpdate.loadField()
//             bookFields.classList.remove('hide-sources')
//         } else {
//             bookFields.classList.add('hide-sources')
//         }
//         if (mediaType.value === 'Movie') {
//             const directorUpdate = new FieldManagerTwo(...Object.values(movieDirectorDetails))
//             const writerUpdate = new FieldManagerTwo(...Object.values(movieWriterDetails))
//             directorUpdate.loadField()
//             writerUpdate.loadField()
//             movieFields.classList.remove('hide-sources')
//         } else {
//             movieFields.classList.add('hide-sources')
//         }
//         if (mediaType.value === 'TV Show') {
//             tvFields.classList.remove('hide-sources')
//         } else {
//             tvFields.classList.add('hide-sources')
//         }
//         if (mediaType.value === 'Comic') {
            
//             const fieldUpdate = new FieldManagerTwo(...Object.values(comicArtistDetails))
//             //const fieldUpdate = new FieldManagerTwo('comic', 'artist', 3)
//             fieldUpdate.loadField()
//             comicFields.classList.remove('hide-sources')
//         } else {
//             comicFields.classList.add('hide-sources')
//         }
//         if (mediaType.value === 'Video Game') {
//             gameFields.classList.remove('hide-sources')
//         } else {
//             gameFields.classList.add('hide-sources')
//         }
//     })
// } else {
//     mediaType.addEventListener('input', event => {
//         event.preventDefault()
//         if (mediaType.value === 'Book') {
//             bookFields.classList.remove('hide-sources')
//         } else {
//             bookFields.classList.add('hide-sources')
//         }
//         if (mediaType.value === 'Movie') {
//             movieFields.classList.remove('hide-sources')
//         } else {
//             movieFields.classList.add('hide-sources')
//         }
//         if (mediaType.value === 'TV Show') {
//             tvFields.classList.remove('hide-sources')
//         } else {
//             tvFields.classList.add('hide-sources')
//         }
//         if (mediaType.value === 'Comic') {
//             comicFields.classList.remove('hide-sources')
//         } else {
//             comicFields.classList.add('hide-sources')
//         }
//         if (mediaType.value === 'Video Game') {
//             gameFields.classList.remove('hide-sources')
//         } else {
//             gameFields.classList.add('hide-sources')
//         }
//     })
// }

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