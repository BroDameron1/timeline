
import { autocompleteListener } from "./autocomplete"

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