import { checkDuplicates } from "./checkDuplicates.js"

const title = document.querySelector('#title')
const mediaType = document.querySelector('#mediaType')
const form = document.querySelector('#editSource')
const div = document.querySelector('#warning')


function idleLogout() {
    let t;
    window.onload = resetTimer;
    window.onmousemove = resetTimer;
    window.onmousedown = resetTimer;  // catches touchscreen presses as well      
    window.ontouchstart = resetTimer; // catches touchscreen swipes as well 
    window.onclick = resetTimer;      // catches touchpad clicks as well
    window.onkeydown = resetTimer;   
    window.addEventListener('scroll', resetTimer, true); // improved; see comments

    function yourFunction() {
        location.href="/dashboard";
        // your function for too long inactivity goes here
        // e.g. window.location.href = 'logout.php';
    }

    function resetTimer() {
        clearTimeout(t);
        t = setTimeout(yourFunction, 20000);  // time is in milliseconds
    }
}
idleLogout();

const changeState = async (newState, sourceId) => {
    try {
        const response = await fetch('/sources/data', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                state: newState,
                sourceId
            })
        })
        return response.status
    } catch (err) {
        console.log('Something went wrong.1', err)
    }
}


window.addEventListener('load', async event => {
    const state = await changeState('checked out', sourceId)
    if (state !== 200) {
        location.href="/dashboard"
        console.log('Something went wrong, please contact an admin.', state)
    }
})

window.addEventListener('beforeunload', async event => {
    const state = await changeState('new', sourceId)
    if (state !== 200) {
        console.log('Something went wrong, please contact an admin.', state)
    }
})

//TODO: Do an AJAX call for ID instead of passing it through EJS?

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