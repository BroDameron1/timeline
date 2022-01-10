//takes one or more inputs and displays a warning on any submission page.

export const generateWarning = (warningContent, fieldId) => {
    const warningDiv = document.querySelector('#warning') //identifies the div in which the warning will appear.

    //uses the fieldId and puts a red border around an incorrect form field
    document.querySelector(`#${fieldId}`).style.border = 'rgb(196, 63, 63) solid 2px' 

    if (typeof warningContent === 'object') {
        console.log(warningContent)
        warningDiv.append(warningContent)
    } else {
        let validationWarning = document.createElement('div')
        validationWarning.textContent = warningContent
        validationWarning.setAttribute('class', 'field-requirements field-invalid')
        warningDiv.append(validationWarning)
    }
}

export const clearWarning = () => {
    const warningDiv = document.querySelector('#warning')

    //clears any red borders around submissions
    document.querySelectorAll('input, select, textarea').forEach((element) => {
        element.style.border = ''
    })

    warningDiv.textContent = ''  //clears the div of any previous content.
}