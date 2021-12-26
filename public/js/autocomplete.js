
import autocomplete from 'autocompleter';

//creates autocomplete functionality for any field that contains the autocomplete class.

export const autocompleteListener = () => {
    const autocompleteFields = document.querySelectorAll('.autocomplete')
    autocompleteFields.forEach((autocompleteField) => {
        autocompleteField.addEventListener('focus', event => {
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
            
                    const response = await fetch('/sources/data?' + new URLSearchParams({
                        field,
                        fieldValue: autocompleteField.value
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
        })
    })
}