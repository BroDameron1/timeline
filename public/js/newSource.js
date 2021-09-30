import { Duplicate, FieldManager } from "./utils.js"

const title = document.querySelector('#title')
const mediaType = document.querySelector('#mediaType')
const form = document.querySelector('#newSource')
const div = document.querySelector('#warning')
const bookFields = document.querySelector('#book-fields')
const movieFields = document.querySelector('#movie-fields')
const tvFields = document.querySelector('#tv-fields')
const gameFields = document.querySelector('#game-fields')
const comicFields = document.querySelector('#comic-fields')
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
    const dateFields = document.querySelectorAll('.date')
    dateFields.forEach(date => {
        date.setAttribute("max", today)
    })
})

form.addEventListener('submit', async event => {
    event.preventDefault()

})

form.addEventListener('submit', async event => {
    event.preventDefault()
    //sets all fields with  no data to disabled so they do not pass in empty strings
    
        //ensures users chooses a mediaType
    if (mediaType.value === 'default') {
        return div.textContent = 'Please select a media type.'
    }

    //checks for duplicates from the frontend
    const submittedRecord = new Duplicate(title.value, mediaType.value, null, 'submitNew')
    const duplicateResult = await submittedRecord.validateDuplicates()
    if(!duplicateResult) {
        return form.submit();
    }
    if(duplicateResult) {
        return div.textContent = duplicateResult
    }

    //loops through all fields and finds any empty ones and disables them so they don't send empty strings
    //TODO: Check if needed after Joi
    const inputs = document.querySelectorAll("input")
    inputs.forEach((input) => {
        if (input.value.length === 0) {
            input.setAttribute('disabled', 'disabled')
        }
    })
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