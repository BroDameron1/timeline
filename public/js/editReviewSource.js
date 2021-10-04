import { idleLogout, Duplicate, StateManager, FieldManager, FieldManagerTwo } from "./utils.js"

const title = document.querySelector('#title')
const mediaType = document.querySelector('#mediaType')
const form = document.querySelector('#editSource')
const div = document.querySelector('#warning')
const bookFields = document.querySelector('#book-fields')
const movieFields = document.querySelector('#movie-fields')
const tvFields = document.querySelector('#tv-fields')
const gameFields = document.querySelector('#game-fields')
const comicFields = document.querySelector('#comic-fields')

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

// window.addEventListener('load', async event => {
//     const state = new StateManager(true, sourceId, 'ReviewSource')
//     const stateResult = await state.updateState()
//     if (stateResult !== 200) {
//         location.href="/dashboard"
//         console.log('Something went wrong, please contact an admin.', state)
//     }
//     setInterval(idleLogout, 1000)
// })

let unloadCheck = false //flag to determine if the beforeunload event fires on submit

window.addEventListener('beforeunload', async event => {
    event.preventDefault()  
    if (!unloadCheck) {
        event.returnValue = 'test'
        const state = new StateManager(false, sourceId, 'ReviewSource')
        const stateResult = await state.updateState()
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

    //sets all fields with  no data to disabled so they do not pass in empty strings
    //fixed on the backend, delete later if this doesn't break anything
    // const inputs = document.querySelectorAll("input")
    // inputs.forEach((input) => {
    //     if (input.value.length === 0) {
    //         input.setAttribute('disabled', 'disabled')
    //     }
    // })

    const submittedRecord = new Duplicate(title.value, mediaType.value, sourceId, 'updateReview')
    const duplicateResult = await submittedRecord.validateDuplicates()
    //TODO: Revisit this conditional    
    if (!duplicateResult) {
        unloadCheck = true
        return form.submit()
    }
    return div.textContent = duplicateResult
})

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


window.addEventListener('load', event => {
    if (mediaType.value === 'Book') {
        const fieldUpdate = new FieldManagerTwo(...Object.values(bookAuthorDetails))
        fieldUpdate.loadField()
        bookFields.classList.remove('hide-sources')
    } else {
        bookFields.classList.add('hide-sources')
    }
    if (mediaType.value === 'Movie') {
        const directorUpdate = new FieldManagerTwo(...Object.values(movieDirectorDetails))
        const writerUpdate = new FieldManagerTwo(...Object.values(movieWriterDetails))
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
         
        const fieldUpdate = new FieldManagerTwo(...Object.values(comicArtistDetails))
        //const fieldUpdate = new FieldManagerTwo('comic', 'artist', 3)
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

movieFields.addEventListener('click', event => {
    const directorUpdate = new FieldManagerTwo(...Object.values(movieDirectorDetails))
    const writerUpdate = new FieldManagerTwo(...Object.values(movieDirectorDetails))
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

comicFields.addEventListener('click', event => {
    //const fieldUpdate = new FieldManagerTwo('comic', 'artist', 3)
    const fieldUpdate = new FieldManagerTwo(...Object.values(comicArtistDetails))
    if (event.target && event.target.matches("a#add-artist")) {
        fieldUpdate.addField('remove-artist')
    }
    if (event.target && event.target.matches("a.remove-artist")) {
        fieldUpdate.deleteField(event.target.parentElement)
        }
})

bookFields.addEventListener('click', event => {
    const fieldUpdate = new FieldManagerTwo(...Object.values(bookAuthorDetails))
    //const fieldUpdate = new FieldManager('add-author', 'book-author', 'book[author][]', 3)
    if (event.target && event.target.matches("a#add-author")) {
        fieldUpdate.addField('remove-author')
    }
    if (event.target && event.target.matches("a.remove-author")) {
        fieldUpdate.deleteField(event.target.parentElement)
    }
})