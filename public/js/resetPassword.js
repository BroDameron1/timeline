//listener for password reset submission to run frontend password validation

import { passwordCheck } from './validatePassword.js';

const resetForm = document.querySelector('#resetForm');
const togglePassword = document.querySelector('#togglePassword')
const newPassword = document.querySelector('#newPassword')
const oldPassword = document.querySelector('#oldPassword')

resetForm.addEventListener('submit', event => {
    event.preventDefault();
    passwordCheck(newPassword.value, resetForm);
})

togglePasswordOld.addEventListener('click', event => {
    // toggle the type attribute
    const type = oldPassword.getAttribute('type') === 'password' ? 'text' : 'password';
    oldPassword.setAttribute('type', type);
});

togglePasswordNew.addEventListener('click', event => {
    // toggle the type attribute
    const type = newPassword.getAttribute('type') === 'password' ? 'text' : 'password';
    newPassword.setAttribute('type', type);
});