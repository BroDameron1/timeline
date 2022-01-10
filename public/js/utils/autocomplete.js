
import autocomplete from 'autocompleter';
import serialize from 'form-serialize-improved'

//creates autocomplete functionality for any field that contains the autocomplete class.


export const autocompleteListener = (targetCollection) => {
    const formSelector = document.querySelector('.form')
    formSelector.addEventListener('focusin', event => {
        //console.log(event, 'event')
        if (event.target && event.target.matches('.autocomplete')) {
            const autocompleteField = event.target
            autocomplete({
                input: autocompleteField,
                emtpyMsg: 'No Results',
                debounceWaitMs: 200,
                preventSubmit: true,
                disableAutoSelect: true,
                fetch: async function(text, update) {
                    let field = autocompleteField.name
                    field = field.replace('[]', '')
                    field = field.replace('[', '.')
                    field = field.replace(']', '')
            
                    const response = await fetch('/utils/data?' + new URLSearchParams({
                        field,
                        fieldValue: autocompleteField.value,
                        collection: targetCollection
                    }))
                    const autofillOptions = await response.json()
                    console.log(autofillOptions)
                    let suggestions = autofillOptions.map(option => {
                        return { 'label': option, 'value:': option}
                    })
                    update(suggestions)
                },
                onSelect: function(item) {
                    autocompleteField.value = item.label
                } 
            })
        }
    })
}