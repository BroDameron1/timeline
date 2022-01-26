
import autocomplete from 'autocompleter';

//creates autocomplete functionality for any field that contains the autocomplete class.

//TODO: Figure out a way to skip the field replace stuff.

export const autocompleteListener = (targetCollection) => {
    const formSelector = document.querySelector('.form')
    let autoResults
    formSelector.addEventListener('focusin', event => {
        if (event.target && event.target.matches('.autocomplete')) {
            const autocompleteField = event.target
            autoResults = autocomplete({
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
            
                    const response = await fetch('/utils/autocomplete?' + new URLSearchParams({
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
    formSelector.addEventListener('focusout', event => {
        if (event.target && event.target.matches('.autocomplete')) {
            autoResults.destroy()
        }
    })
}