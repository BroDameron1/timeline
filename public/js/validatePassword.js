const passwordFail = (element) => {
    element.classList.add('password-fail');
}

const passwordSuccess = (element) => {
    element.classList.remove('password-fail')
    element.classList.add('password-success')
}

//function to check password and display to the user what is wrong with their password
const passwordRequirements = (password) => {
    const pwdLength = document.querySelector('#length');
    const pwdSymbols = document.querySelector('#symbols');
    const pwdUpper = document.querySelector('#uppercase');
    const pwdLower = document.querySelector('#lowercase');
    const pwdNumbers = document.querySelector('#numbers');
    
    if (password.length < 8 || password.length > 32) {
        passwordFail(pwdLength);
    } else {
        passwordSuccess(pwdLength);
    }

    if (!password.match(/\d/)) {
        passwordFail(pwdNumbers);
    } else {
        passwordSuccess(pwdNumbers);
    }

    if (!password.match(/[a-z]/)) {
        passwordFail(pwdLower);
    } else {
        passwordSuccess(pwdLower);
    }

    if (!password.match(/[A-Z]/)) {
        passwordFail(pwdUpper);
    } else {
        passwordSuccess(pwdUpper);
    }

    if (!password.match(/[\@\!\#\$\%\*\+\&]/)) {
        passwordFail(pwdSymbols);
    } else {
        passwordSuccess(pwdSymbols);
    }
}

//function that validates if password meets requirements and if it does not, sends it to
//the passwordRequirements function to display to user.  Submits if requirements are met.
export const passwordCheck = (password, form) => {
    //regex that requires capital letters
    const regEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,32}$)/;

    //regex that does not include capital letters
    //const regEx = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,32}$)/;
    
    //check if password meets requirements.  If so, submit form.  If not, run function to display problems to user.
    if (!password.match(regEx)) {
        passwordRequirements(password);
    } else {
        form.submit();
    }
}


