//listener for new user register submission to run frontend password validation

import { passwordCheck } from './validatePassword.js';

const registerForm = document.querySelector('#registerForm');
const password = document.querySelector('#password');
const togglePassword = document.querySelector('#togglePassword')

registerForm.addEventListener('submit', event => {
    //const password = document.querySelector('#password').value;
    event.preventDefault();
    passwordCheck(password.value, registerForm);
})


togglePassword.addEventListener('click', event => {
    // toggle the type attribute
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
});