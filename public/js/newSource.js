import { Duplicate } from "./utils.js"

const title = document.querySelector('#title')
const mediaType = document.querySelector('#mediaType')
const form = document.querySelector('#newSource')
const div = document.querySelector('#warning')


form.addEventListener('submit', async event => {
    event.preventDefault()
    const submittedRecord = new Duplicate(title.value, mediaType.value, null, 'submitNew')
    const duplicateResult = await submittedRecord.validateDuplicates()
    if(!duplicateResult) {
        return form.submit();
    }
    if(duplicateResult) {
        return div.textContent = duplicateResult
    }
})
