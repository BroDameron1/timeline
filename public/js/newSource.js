import { Duplicate } from "./utils.js"

const title = document.querySelector('#title')
const mediaType = document.querySelector('#mediaType')
const form = document.querySelector('#newSource')
const div = document.querySelector('#warning')
const bookFields = document.querySelector('#book-fields')
const movieFields = document.querySelector('#movie-fields')
const tvFields = document.querySelector('#tv-fields')
const gameFields = document.querySelector('#game-fields')
const comicFields = document.querySelector('#comic-fields')
const addAuthor = document.querySelector('#add-author')
const sourceImage = document.querySelector('#sourceImage')

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
    // document.getElementById("datefield").setAttribute("max", today);
    const dateFields = document.querySelectorAll('.date')
    console.log(dateFields)
    dateFields.forEach(date => {
        date.setAttribute("max", today)
    })
})

form.addEventListener('submit', async event => {
    event.preventDefault()
    if (mediaType.value === 'default') {
        return div.textContent = 'Please select a media type.'
    }
    const submittedRecord = new Duplicate(title.value, mediaType.value, null, 'submitNew')
    const duplicateResult = await submittedRecord.validateDuplicates()
    if(!duplicateResult) {
        return form.submit();
    }
    if(duplicateResult) {
        return div.textContent = duplicateResult
    }
})


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

