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
        t = setTimeout(yourFunction, 10000);  // time is in milliseconds
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
        console.log('Something went wrong.', err)
    }

}


window.addEventListener('load', async event => {
    const state = await changeState('checked out', sourceId)
    if (state !== 200) {
        location.href="/dashboard"
        console.log('Something went wrong, please contact an admin.')
    }
})

window.addEventListener('beforeunload', async event => {
    const state = await changeState('new', sourceId)
    if (state !== 200) {
        location.href="/dashboard"
        console.log('Something went wrong, please contact an admin.')
    }
})

//TODO: Do an AJAX call for ID instead of passing it through EJS?