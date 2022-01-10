
import { suppressLeavePrompt } from './leavePrompt'

//variables and function for idling out a user while they are editing a record.
const warningPopup = document.querySelector('.warning-popup')
const countdownTimer = document.querySelector('.countdown-timer')
const blurBackground = document.querySelector('.disableDiv')
const timerButton = document.querySelector('#timerButton')

//create a throttle so the idleLogout function isn't running every single time an event is occurring.

const startingMinutes = 1.2 //sets timeout for page
const warningTime = 1 * 60 //sets time when warning will pop up
let time = startingMinutes * 60 //timer for use in idleLogout function, should not change
let intervalStart = null

//function to remove all event listeners
const formTimeoutEventRemover = () => {
    window.removeEventListener('load', formTimeout)
    window.removeEventListener('mousemove', formTimeout)
    window.removeEventListener('mousedown', formTimeout) // catches touchscreen presses as well
    window.removeEventListener('touchstart', formTimeout) // catches touchscreen swipes as well
    window.removeEventListener('click', formTimeout) // catches touchpad clicks as well
    window.removeEventListener('keydown', formTimeout)
    window.removeEventListener('scroll', formTimeout, true);
}

//starts the countdown after 2 minutes.  If a previously countdown had been started, resets the timer, removes the eventlisteners and stops the countdown and then starts it back up again after 2 minutes.
//this ensures that the countdown only needs to pick uformTimeout minutes in order to reset the timer instead of picking up every event all the time.
export const formTimeout = () => {
    if (intervalStart) {
        // if (time > warningTime) { //resets the timer to full as long as the warning window isn't up.
        //     time = startingMinutes * 60
        // }
        time = startingMinutes * 60 //resets the time back to default
        formTimeoutEventRemover() //removes all event listeners
        clearInterval(intervalStart) //stops the idleLogout function from running every 1 second.
    }
    //all listeners are removed and the idleLogout function is stopped until the below function starts
    //function will run after the amount of time specified at the end.
    setTimeout(() => {
        intervalStart = setInterval(idleLogout, 1000)  //runs the idleLogout function every second after starting
        //create all the event listeners that will rerun the formTimeout function from the start.
        window.addEventListener('load', formTimeout)
        window.addEventListener('mousemove', formTimeout)
        window.addEventListener('mousedown', formTimeout) 
        window.addEventListener('touchstart', formTimeout) 
        window.addEventListener('click', formTimeout) 
        window.addEventListener('keydown', formTimeout)
        window.addEventListener('scroll', formTimeout, true);
    }, 1000 * 60 * 1)
}


const idleLogout = () => { //function for kicking user out of the page if they don't take any action

    const closePopup = () => { 
        warningPopup.style.display = 'none' //closes the warning popup
        blurBackground.style.display = 'none' //closes the warning popup
        // time = startingMinutes * 60 //resets the time back to default
        timerButton.removeEventListener('click', closePopup) //removes the timerbutton eventlistener associated with the popup
        formTimeout() //runs the function to eventually restart the timer again.
    }
    
    const openPopup = () => { //creates the popup
        warningPopup.style.display = 'block'
        blurBackground.style.display = 'block'
    }
   
    //converts the time to show minutes and seconds
    const minutes = Math.floor(time / 60)
    let seconds = time % 60
    seconds = seconds < 10 ? '0' + seconds : seconds //adds an extra zero when less than 10

    if (time === warningTime) {
        openPopup() //opens the pop up ONCE
        formTimeoutEventRemover() //removes all other eventlisteners
        timerButton.addEventListener('click', closePopup) //creates a SINGLE event listener for the close button which runs the closePopup function.
    }

    if (time <= warningTime) {
        countdownTimer.innerHTML = `${minutes}:${seconds}` //changes the timer in the popup every second
    }

    if (time <= 0) {  //when the timer reaches zero, boots them out.
        suppressLeavePrompt() //don't want a dialog box, set flag to false.
        location.href = '/dashboard' //redirects to the dashboard
    }

    console.log(minutes, seconds)
    time-- //subtracts one second from the time
}
