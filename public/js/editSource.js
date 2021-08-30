import { checkDuplicates, Duplicate } from "./checkDuplicates.js"

const title = document.querySelector('#title')
const mediaType = document.querySelector('#mediaType')
const form = document.querySelector('#editSource')
const div = document.querySelector('#warning')
const button = document.querySelector('.btn-submit')
const countdown = document.querySelector('.countdown-popup')
const countdownTimer = document.querySelector('.countdown-timer')
const blurBackground = document.querySelector('.disableDiv')
const timerButton = document.querySelector('#timerButton')

const startingMinutes = 1.1 //sets timeout for page
const warningTime = 1 * 60 //sets time when warning will pop up
let time = startingMinutes * 60 //timer for use in idleLogout function, should not change


const idleLogout = () => { //function for kicking user out of the page if they don't take any action

    const closePopup = () => { //closes the warning popup and resets everything
        countdown.style.display = 'none'
        blurBackground.style.display = 'none'
        time = startingMinutes * 60
    }
    
    const openPopup = () => { //opens a popup at the warning time to tell user they will be kicked out
        countdownTimer.innerHTML = `${minutes}:${seconds}`
        countdown.style.display = 'block'
        blurBackground.style.display = 'block'
        timerButton.addEventListener('click', closePopup)
    }

    const resetTimer = () => {
        if (time > warningTime) {
            time = startingMinutes * 60
        }
    }
    
    const minutes = Math.floor(time / 60)
    let seconds = time % 60
    seconds = seconds < 10 ? '0' + seconds : seconds

    if (time <= warningTime) {
        openPopup()
    }

    if (time <= 0) {
        location.href = '/dashboard'
    }

    console.log(minutes, seconds)
    time--
    window.onload = resetTimer;
    window.onmousemove = resetTimer;
    window.onmousedown = resetTimer;  // catches touchscreen presses as well      
    window.ontouchstart = resetTimer; // catches touchscreen swipes as well 
    window.onclick = resetTimer;      // catches touchpad clicks as well
    window.onkeydown = resetTimer;   
    window.addEventListener('scroll', resetTimer, true); // improved; see comments
}

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
    setInterval(idleLogout, 1000)
})


window.addEventListener('beforeunload', async event => {
        const state = await changeState('new', sourceId)
        if (state !== 200) {
            console.log('Something went wrong, please contact an admin.', state)
        }
})

// TODO: Do an AJAX call for ID instead of passing it through EJS?

form.addEventListener('submit', async event => {
    event.preventDefault()
    const submittedRecord = new Duplicate(title.value, mediaType.value, sourceId)
    const duplicateResult = await submittedRecord.checkBothDuplicates()
    if (duplicateResult === true) {
        return form.submit()
    }
    return div.textContent = duplicateResult
})