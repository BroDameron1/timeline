import { autocompleteListener } from "./autocomplete"
import { generateWarning } from './warning'
import { suppressLeavePrompt } from './leavePrompt'

//TODO: Can it be expanded to work with any record?
export class Duplicate {
    constructor (title, mediaType, sourceId, type) {
        this.title = title
        this.mediaType = mediaType || null
        this.sourceId = sourceId || null
        this.type = type
    }
    async checkDuplicates () {
        const response = await fetch('/sources/data?' + new URLSearchParams({
            title: this.title,
            mediaType: this.mediaType,
            sourceId: this.sourceId,
            type: this.type
        }))
        return response.json()
    }

    async validateDuplicates () {
        const duplicateResponse = await this.checkDuplicates()
        if (!duplicateResponse) return false
        if (duplicateResponse.title) {
            //create the link
            let duplicateLink = document.createElement('a')
            duplicateLink.textContent = duplicateResponse.title
            duplicateLink.href = `/sources/${duplicateResponse.slug}`
            duplicateLink.setAttribute('target', '_blank')
            //create a span to put the link in.
            let warningSpan = document.createElement('div')
            warningSpan.textContent = 'There is already a record with this title: '
            warningSpan.setAttribute('class', 'field-requirements field-invalid')
            warningSpan.append(duplicateLink)
            generateWarning(warningSpan, 'title')
            return true //return the span with think link included.
        } else {
            generateWarning('A record with that title is already under review.', 'title')
            return true
        }
    }
}

//Class for managing record state from the front end
export class StateManager {
    constructor(checkedOut, sourceId, targetCollection) {
        this.checkedOut = checkedOut
        this.sourceId = sourceId
        this.targetCollection = targetCollection
    }

    async updateState () {
        const checkedOutRequest = JSON.stringify({
            checkedOut: this.checkedOut,
            sourceId: this.sourceId,
            collection: this.targetCollection
        })

        const beacon = await navigator.sendBeacon('/sources/data', checkedOutRequest)
        if (!beacon) {
            console.log('Something went wrong.',  err)
        }
    }
}

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
const userActivityEventRemover = () => {
    window.removeEventListener('load', userActivityThrottler)
    window.removeEventListener('mousemove', userActivityThrottler)
    window.removeEventListener('mousedown', userActivityThrottler) // catches touchscreen presses as well
    window.removeEventListener('touchstart', userActivityThrottler) // catches touchscreen swipes as well
    window.removeEventListener('click', userActivityThrottler) // catches touchpad clicks as well
    window.removeEventListener('keydown', userActivityThrottler)
    window.removeEventListener('scroll', userActivityThrottler, true);
}

//starts the countdown after 2 minutes.  If a previously countdown had been started, resets the timer, removes the eventlisteners and stops the countdown and then starts it back up again after 2 minutes.
//this ensures that the countdown only needs to pick up one event every two minutes in order to reset the timer instead of picking up every event all the time.
export const userActivityThrottler = () => {
    if (intervalStart) {
        // if (time > warningTime) { //resets the timer to full as long as the warning window isn't up.
        //     time = startingMinutes * 60
        // }
        time = startingMinutes * 60 //resets the time back to default
        userActivityEventRemover() //removes all event listeners
        clearInterval(intervalStart) //stops the idleLogout function from running every 1 second.
    }
    //all listeners are removed and the idleLogout function is stopped until the below function starts
    //function will run after the amount of time specified at the end.
    setTimeout(() => {
        intervalStart = setInterval(idleLogout, 1000)  //runs the idleLogout function every second after starting
        //create all the event listeners that will rerun the userActivityThrottler function from the start.
        window.addEventListener('load', userActivityThrottler)
        window.addEventListener('mousemove', userActivityThrottler)
        window.addEventListener('mousedown', userActivityThrottler) 
        window.addEventListener('touchstart', userActivityThrottler) 
        window.addEventListener('click', userActivityThrottler) 
        window.addEventListener('keydown', userActivityThrottler)
        window.addEventListener('scroll', userActivityThrottler, true);
    }, 1000 * 60 * 1)
}


const idleLogout = () => { //function for kicking user out of the page if they don't take any action

    const closePopup = () => { 
        warningPopup.style.display = 'none' //closes the warning popup
        blurBackground.style.display = 'none' //closes the warning popup
        // time = startingMinutes * 60 //resets the time back to default
        timerButton.removeEventListener('click', closePopup) //removes the timerbutton eventlistener associated with the popup
        userActivityThrottler() //runs the function to eventually restart the timer again.
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
        userActivityEventRemover() //removes all other eventlisteners
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


export class FieldManager {
    constructor (media, job, additionalFields) {
        this.media = media,
        this.job = job,
        this.additionalFields = additionalFields
    }

    //creates a remove link, needed for the addField method and loadField method
    createRemoveLink(job) {
        //create link to remove the associated input
        let removeButton = document.createElement('a')
        //set link text to Remove
        removeButton.textContent = 'Remove'
        //don't let the link go anywhere.
        removeButton.href = "#"
        //set class so the event listener can find it
        removeButton.setAttribute('class', `remove-${job}`)
        return removeButton
    }

    //add a new input function
    addField () {
        //find the link so new elements can be placed in reference to it
        const addFieldLink = document.querySelector(`#add-${this.job}`)
        //create a node list of current input fields.
        const totalFieldList = document.querySelectorAll(`.${this.media}-${this.job}`)

        //check if the number of input fields is less than or equal to the number of specified fields.
        if (totalFieldList.length <= this.additionalFields) {
            //create div and add before link
            let newDiv = document.createElement('div')
            //set new div to have a class of form-field (styling only)
            newDiv.setAttribute('class', 'form-field')
            //set the new div to have a unique id specific to this field
            newDiv.setAttribute('id', `${this.media}-${this.job}-${totalFieldList.length}`)
            //place the new div before the add field link
            addFieldLink.parentNode.insertBefore(newDiv, addFieldLink)

            //create input field
            let newInput = document.createElement('input')
            //set to text input
            newInput.type = 'text'
            //set to same class that totalFieldList looks for.  ALso adds autocomplete class to allow that functionality.
            newInput.setAttribute('class', `${this.media}-${this.job} autocomplete`)

            //set id to allow the box to be highlighted for validation errors
            //this must be different than the div id for proper selection and highlighting
            newInput.setAttribute('id', `${this.media}-${this.job}${totalFieldList.length}`)

            //set name to allow it to be passed in the request body.  This name is the same on each input.
            newInput.setAttribute('name', `${this.media}[${this.job}][]`)
            //sets the max length of the new field
            newInput.setAttribute('maxlength', '80')
            //adds new input field into the previously created div
            newDiv.append(newInput)


            //Create a link with the method and add it inside the new div
            newDiv.append(this.createRemoveLink(this.job))

            //fires the autocompleteListener function again so autocomplete works on the new field
            autocompleteListener()
        }
        //Check if we have the max number of inputs and then remove the add link if true
        if (totalFieldList.length === this.additionalFields) {
            addFieldLink.classList.add('hide-sources')
        }
    }

    //delete an existing input function (except the first one)
    deleteField (elementToDelete) {
        //remove parent element of link
        elementToDelete.remove()
        //identify the Add input link.
        const addFieldLink = document.querySelector(`#add-${this.job}`)
        //indetify the total number of current inputs.
        const totalFieldList = document.querySelectorAll(`.${this.media}-${this.job}`)

        //readd the add input link if there are less than the max fields.
        if (totalFieldList.length <= this.additionalFields) {
            addFieldLink.classList.remove('hide-sources')
        }
    }

    //when the page loads, all the input fields are dynamically added by a loop in the
    //EJS file.  The EJS file can't add the dynamic ids of the fields, this method does that on load of the page
    //so that the fields have the remove capability.
    loadField () {
        //find the link so new elements can be placed in reference to it
        const addFieldLink = document.querySelector(`#add-${this.job}`)
        //identify all input fields
        const totalFieldList = document.querySelectorAll(`.${this.media}-${this.job}`)
        //if there is more than one entry, start the loop
        if (totalFieldList.length > 1) {
            //loop over each field starting at position one (skipping the first one)
            for (let i = 1; i < totalFieldList.length; i++) {
                //set input to the current field in the nodelist
                let input = totalFieldList[i]
                //add the dynamic id to the div housing the input.
                input.parentElement.setAttribute("id", `${this.media}-${this.job}-${i}`)

                //create remove link with method and insert it after the input.
                input.parentNode.insertBefore(this.createRemoveLink(this.job), input.nextSibling)
            }
        }

        //Check if we have the max number of inputs and then remove the add link if true
        if (totalFieldList.length > this.additionalFields) {
            addFieldLink.classList.add('hide-sources')
        }
    }    
}