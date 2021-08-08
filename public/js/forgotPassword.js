//listener for forgotten password submission to run frontend password validation

import { passwordCheck } from './validatePassword.js';

const forgotForm = document.querySelector('#forgotPassword');
const togglePassword = document.querySelector('#togglePassword')
const password = document.querySelector('#newPassword')

forgotForm.addEventListener('submit', event => {
    event.preventDefault();
    passwordCheck(password.value, forgotForm);
})


togglePassword.addEventListener('click', event => {
    // toggle the type attribute
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
});