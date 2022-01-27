
import autocomplete from 'autocompleter';


//TODO: Figure out a way to skip the field replace stuff.
//TODO: Add styling

export const autocompleteListener = (targetCollection) => { //targetCollection is where the autofill function is the collection autofill should check for the data.  This should always be public.
    const formSelector = document.querySelector('.form') //select the entire form
    let autocomplMethods //sets a variable for the entire autocomplete library so the destroy method can be run later
    formSelector.addEventListener('focusin', event => { //event listener for focusing on the form
        if (event.target && event.target.matches('.autocomplete')) { //listener only triggers if a field with the autocomplete class is chosen.
            const autocompleteField = event.target //sents the chosen field to a variable
            autocomplMethods = autocomplete({ //runs the autocomplete library with set options and data
                input: autocompleteField, //defines which field the autocompleter is working with
                emtpyMsg: 'No Results', //message to display if there are no matches
                debounceWaitMs: 200, //ensures the query is made only if a user stops typing for the set number of milliseconds
                preventSubmit: true, //doesn't submit the form if a user pushes the enter key
                disableAutoSelect: true, //prevents the first item in the list from being auto-selected
                fetch: async function(text, update) { //defines where to fetch the data from
                    let field = autocompleteField.name //sets the field name to a new variable
                    field = field.replace('[]', '') //the next three lines remove current formatting and replaces it with JSON friendly formatting.
                    field = field.replace('[', '.')
                    field = field.replace(']', '')
            
                    const response = await fetch('/utils/autocomplete?' + new URLSearchParams({ //fetch request to send the data
                        field, //field name
                        fieldValue: autocompleteField.value, //field value
                        collection: targetCollection //collection to search
                    }))
                    const autofillOptions = await response.json() //sets the response values to a variable
                    console.log(autofillOptions)
                    let suggestions = autofillOptions.map(option => { //creates a new array that makes each response an object with a label and value
                        return { 'label': option, 'value:': option}
                    })
                    update(suggestions) //updates the available options with the array of objects from the suggestions variable
                },
                onSelect: function(item) {
                    autocompleteField.value = item.label //sents the autocomplete value to the previously defined item label when a user clicks on it.
                }
            })
        }
    })
    formSelector.addEventListener('focusout', event => { //when the user leaves the field, runs the autocomplete destroy method which gets rid of all related eventlisteners and stored data
        if (event.target && event.target.matches('.autocomplete')) {
            autocomplMethods.destroy()
        }
    })
}