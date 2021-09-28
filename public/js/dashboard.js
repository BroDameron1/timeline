const warningPopup = document.querySelector('.warning-popup')
const blurBackground = document.querySelector('.disableDiv')
const deleteConfirmation = document.querySelector('#delete-confirmation')
let deleteButtons = document.querySelectorAll('.delete-record')
const cancelDelete = document.querySelector('.btn-blue')

deleteButtons.forEach((deleteBtn) => {
    deleteBtn.addEventListener('submit', event => {
        event.preventDefault()
        warningPopup.style.display = 'block'
        blurBackground.style.display = 'block'
        deleteConfirmation.addEventListener('submit', event => {
            event.preventDefault()
            const deleteValidate = document.querySelector('#delete-validate').value
            if (deleteValidate === 'DELETE') {
                return deleteBtn.submit()
            } else {
                document.querySelector('#delete-validate').style.border = 'rgb(196, 63, 63) solid 2px'
            }
        })
        cancelDelete.addEventListener('click', event => {
            warningPopup.style.display = 'none'
            blurBackground.style.display = 'none'
        })
    })
})