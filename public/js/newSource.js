

const title = document.querySelector('#title')
const mediaType = document.querySelector('#mediaType')
const form = document.querySelector('#newSource')
const div = document.querySelector('#warning')

const checkDuplicates = async (data) => {
    const response = await fetch('/sources/data?' + new URLSearchParams({
        title: data.title,
        mediaType: data.mediaType,
    }))
    return response.json()
}

form.addEventListener('submit', async event => {
    event.preventDefault()
    const dataToCheck = {
        title: title.value,
        mediaType: mediaType.value
    }
    const duplicateResult = await checkDuplicates(dataToCheck)
    if(!duplicateResult) {
        return form.submit();
    }
    if(duplicateResult.title) {
        //TODO: Fix this so it will properly display a link.
        return div.textContent = `A matching record already exists. ${duplicateResult.title}, ${duplicateResult._id}`
    } else {
        return div.textContent = `A matching record has already been submitted.`
    }
})