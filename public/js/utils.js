
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
            //collection
        }))
        return response.json()
    }

    async validateDuplicates () {
        const duplicateResponse = await this.checkDuplicates()
        if (!duplicateResponse) return false
        //TODO: Fix this so it will properly display a link.
        if (duplicateResponse.title) {
            return `That record already exists. ${duplicateResponse.title}, ${duplicateResponse._id}`
        } else {
            return `A record with that title is already under review.`
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
        try {
            const response = await fetch('/sources/data', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    checkedOut: this.checkedOut,
                    sourceId: this.sourceId,
                    collection: this.targetCollection
                })
            })
            return response.status
        } catch (err) {
            console.log('Something went wrong.', err)
        }
    }
}

//variables and function for idling out a user while they are editing a record.
const warningPopup = document.querySelector('.warning-popup')
const countdownTimer = document.querySelector('.countdown-timer')
const blurBackground = document.querySelector('.disableDiv')
const timerButton = document.querySelector('#timerButton')

const startingMinutes = 20 //sets timeout for page
const warningTime = 1 * 60 //sets time when warning will pop up
let time = startingMinutes * 60 //timer for use in idleLogout function, should not change

export const idleLogout = () => { //function for kicking user out of the page if they don't take any action

    const closePopup = () => { //closes the warning popup and resets everything
        warningPopup.style.display = 'none'
        blurBackground.style.display = 'none'
        time = startingMinutes * 60
    }
    
    const openPopup = () => { //opens a popup at the warning time to tell user they will be kicked out
        countdownTimer.innerHTML = `${minutes}:${seconds}`
        warningPopup.style.display = 'block'
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

// export class FieldManager {
//     constructor (addClass, inputClass, inputName, additionalFields) {
//         //class of the add link.  Used to determine where the link is to place other objects
//         //OR hide the link if the maximum fields have been added
//         this.addClass = addClass,
//         //class for the input field(s).  Used to add the appropriate class to the new fields or count the existing
//         //number of fields.
//         this.inputClass = inputClass,
//         //used to give the appropriate name to the field.
//         this.inputName = inputName,
//         //number of additional fields that can be added.
//         this.additionalFields = additionalFields
//     }

//     addField (removeClass) {
//         const addLink = document.querySelector(`#${this.addClass}`)
//         const currentCount = document.querySelectorAll(`.${this.inputClass}`)
//         if (currentCount.length <= this.additionalFields) {
//             addLink.insertAdjacentHTML('beforebegin', `<div class="form-field" id="${this.addClass}${currentCount.length}"><input type="text" class="${this.inputClass}" name="${this.inputName}">
//             <a href="#" class="${removeClass}" id="${currentCount.length}">Remove</a></div>`)
//             }
//         if (currentCount.length === this.additionalFields) {
//             addLink.classList.add('hide-sources')
//         }
//     }

//     deleteField (fieldId) {
//         const addLink = document.querySelector(`#${this.inputClass}`)
//         const element = document.querySelector(`#${this.addClass}${fieldId}`)
//         element.remove()
//         const currentCount = document.querySelectorAll(`.${this.countClass}`) //current number of fields after removing the element.
//         if (currentCount.length <= this.additionalFields) {
//             addLink.classList.remove('hide-sources')
//         }
//     }

//     loadField (removeClass) {
//         const inputBoxes = document.querySelectorAll(`.${this.inputClass}`)
//         if(inputBoxes.length > 1) {
//             for (let i = 1; i < inputBoxes.length; i++) {
//             let input = inputBoxes[i]
//             input.parentElement.setAttribute("id", `${this.inputClass}${i}`)
//             input.insertAdjacentHTML('afterend', `<a href="#" class="${removeClass}" id="${i}">Remove</a>`)
//              }
//         }
//     }
// }


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
            newDiv.setAttribute('id', `${this.media}-${this.job}${totalFieldList.length}`)
            //place the new div before the add field link
            addFieldLink.parentNode.insertBefore(newDiv, addFieldLink)

            //create input field
            let newInput = document.createElement('input')
            //set to text input
            newInput.type = 'text'
            //set to same class that totalFieldList looks for
            newInput.setAttribute('class', `${this.media}-${this.job}`)
            //set name to allow it to be passed in the request body.  This name is the same on each input.
            newInput.setAttribute('name', `${this.media}[${this.job}][]`)
            //sets the max length of the new field
            newInput.setAttribute('maxlength', '80')
            //adds new input field into the previously created div
            newDiv.append(newInput)


            //Create a link with the method and add it inside the new div
            newDiv.append(this.createRemoveLink(this.job))
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
                input.parentElement.setAttribute("id", `${this.media}-${this.job}${i}`)

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