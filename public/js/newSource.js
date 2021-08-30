import { checkDuplicates, Duplicate } from "./checkDuplicates.js"

const title = document.querySelector('#title')
const mediaType = document.querySelector('#mediaType')
const form = document.querySelector('#newSource')
const div = document.querySelector('#warning')


// form.addEventListener('submit', async event => {
//     event.preventDefault()
//     const dataToCheck = {
//         title: title.value,
//         mediaType: mediaType.value
//     }
//     const duplicateResult = await checkDuplicates(dataToCheck)
//     if(!duplicateResult) {
//         return form.submit();
//     }
//     if(duplicateResult.title) {
//         //TODO: Fix this so it will properly display a link.
//         return div.textContent = `A matching record already exists. ${duplicateResult.title}, ${duplicateResult._id}`
//     } else {
//         return div.textContent = `A matching record has already been submitted.`
//     }
// })

form.addEventListener('submit', async event => {
    event.preventDefault()
    const submittedRecord = new Duplicate(title.value, mediaType.value)
    const duplicateResult = await submittedRecord.checkBothDuplicates()
    if (duplicateResult === true) {
        return form.submit()
    }
    return div.textContent = duplicateResult
})