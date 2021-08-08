const password = document.querySelector('#password');
const togglePassword = document.querySelector('#togglePassword')

togglePassword.addEventListener('click', event => {
    // toggle the type attribute
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
});