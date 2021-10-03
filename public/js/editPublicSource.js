import { idleLogout, Duplicate, StateManager, FieldManager } from "./utils.js"

const title = document.querySelector('#title')
const mediaType = document.querySelector('#mediaType')
const form = document.querySelector('#editSource')
const div = document.querySelector('#warning')
const bookFields = document.querySelector('#book-fields')
const movieFields = document.querySelector('#movie-fields')
const tvFields = document.querySelector('#tv-fields')
const gameFields = document.querySelector('#game-fields')
const comicFields = document.querySelector('#comic-fields')
const addAuthor = document.querySelector('#add-author')

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


window.addEventListener('load', async event => {
    const state = new StateManager(true, sourceId, 'PublicSource')
    const stateResult = await state.updateState()
    if (stateResult !== 200) {
        location.href="/dashboard"
        console.log('Something went wrong, please contact an admin.', state)
    }
    setInterval(idleLogout, 1000)
})

let unloadCheck = false //flag to determine if the beforeunload event fires on submit

window.addEventListener('beforeunload', async event => {
    event.preventDefault()  
    if (!unloadCheck) {
        event.returnValue = 'test'
        const state = new StateManager(false, sourceId, 'PublicSource')
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
    //handled on the backend, will delete if nothing breaks
    // const inputs = document.querySelectorAll("input")
    // inputs.forEach((input) => {
    //     if (input.value.length === 0) {
    //         input.setAttribute('disabled', 'disabled')
    //     }
    // })

    const submittedRecord = new Duplicate(title.value, mediaType.value, sourceId, 'editPublic')
    const duplicateResult = await submittedRecord.validateDuplicates()
    //TODO: Revisit this conditional    
    if (!duplicateResult) {
        unloadCheck = true
        return form.submit()
    }
    return div.textContent = duplicateResult
})

window.addEventListener('load', event => {
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

    const authorCount = document.querySelectorAll('.book-author')
    if (authorCount.length === 4) {
        addAuthor.classList.add('hide-sources')
    }
})

sourceImage.addEventListener('change', event => {
    const imgPreview = document.querySelector('.image-preview')
    const file = document.querySelector('input[type=file]').files[0]
    console.log(file)
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
    const directorUpdate = new FieldManager('add-director', 'movie-director', 'movie[director][]', 1)
    const writerUpdate = new FieldManager('add-writer', 'movie-writer', 'movie[writer][]', 3)
    if (event.target && event.target.matches("a#add-director")) {
        directorUpdate.addField('remove-director')
    }
    if (event.target && event.target.matches("a.remove-director")) {
        directorUpdate.deleteField(event.target.id)
    }
    
    if (event.target && event.target.matches("a#add-writer")) {
        writerUpdate.addField('remove-writer')
    }
    if (event.target && event.target.matches("a.remove-writer")) {
        writerUpdate.deleteField(event.target.id)
    }
})

comicFields.addEventListener('click', event => {
    const fieldUpdate = new FieldManager('add-artist', 'art-contributor', 'comic[artContributor][]', 3)
    if (event.target && event.target.matches("a#add-artist")) {
        fieldUpdate.addField('remove-artist')
    }
    if (event.target && event.target.matches("a.remove-artist")) {
        fieldUpdate.deleteField(event.target.id)
        }
})


bookFields.addEventListener('click', event => {
    const fieldUpdate = new FieldManager('add-author', 'book-author', 'book[author][]', 3)
    if (event.target && event.target.matches("a#add-author")) {
        fieldUpdate.addField('remove-author')
    }
    if (event.target && event.target.matches("a.remove-author")) {
        fieldUpdate.deleteField(event.target.id)
    }
})