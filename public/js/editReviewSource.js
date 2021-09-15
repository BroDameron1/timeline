import { idleLogout, Duplicate, StateManager } from "./utils.js"

const title = document.querySelector('#title')
const mediaType = document.querySelector('#mediaType')
const form = document.querySelector('#editSource')
const div = document.querySelector('#warning')
const button = document.querySelector('.btn-submit')
const bookFields = document.querySelector('#book-fields')
const movieFields = document.querySelector('#movie-fields')
const tvFields = document.querySelector('#tv-fields')
const gameFields = document.querySelector('#game-fields')
const comicFields = document.querySelector('#comic-fields')
const addAuthor = document.querySelector('#add-author')



window.addEventListener('load', async event => {
    const state = new StateManager(true, sourceId, 'ReviewSource')
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
    const submittedRecord = new Duplicate(title.value, mediaType.value, sourceId, 'updateReview')
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

addAuthor.addEventListener('click', event => {
    const authorCount = document.querySelectorAll('.book-author')
    console.log(authorCount.length)
    if (authorCount.length <= 3) {
        addAuthor.insertAdjacentHTML('beforebegin', `<div class="form-field"><input type="text" class="book-author" name="book[author][]"></div>`)
    }
    if (authorCount.length === 3) {
        addAuthor.classList.add('hide-sources')
    }
})