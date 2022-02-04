import { rejectPublish } from "./rejectPublish";
import { sourceSchema, eventSchema } from '../../../schemas'



const populateFormInfo = (formProperties) => {
    
    switch (formProperties.formClass) {
        case 'sourceForm':
            formProperties.schema = sourceSchema
            switch (formProperties.formId) {
                case 'newSource':
                    formProperties.existingSource = false
                    formProperties.duplicateCheck = 'submitNew'
                    formProperties.lockLocation = 'ReviewSource'
                break;
                case 'updateReviewSource':
                    formProperties.duplicateCheck = 'updateReview'
                    formProperties.lockLocation = 'ReviewSource'
                break;
                case 'publishSource':
                    formProperties.duplicateCheck = 'publishRecord'
                    formProperties.lockLocation = 'ReviewSource'
                    rejectPublish(formProperties)
                break;
                case 'updatePublicSource':
                    formProperties.duplicateCheck = 'editPublic'
                    formProperties.lockLocation = 'PublicSource'
                break;
            }
        break;
        case 'eventForm':
            formProperties.schema = eventSchema
            switch (formProperties.formId) {
                case 'newEvent':
                    formProperties.existingSource = false
                    formProperties.duplicateCheck = 'submitNew'
                    formProperties.lockLocation = 'ReviewEvent'
                break;
                case 'updateReviewEvent':
                    formProperties.duplicateCheck = 'updateReview'
                    formProperties.lockLocation = 'ReviewEvent'
                break;
                case 'publishEvent':
                    formProperties.duplicateCheck = 'publishRecord'
                    formProperties.lockLocation = 'ReviewEvent'
                    rejectPublish(formProperties)
                break;
                case 'updatePublicEvent':
                    formProperties.duplicateCheck = 'editPublic'
                    formProperties.lockLocation = 'PublicEvent'
                break;
            }
        break;
    }
    return formProperties
}


export const gatherFormInfo = () => {
    const formType = document.querySelector('[data-formtype]')
    const formClass = formType.className
    const formId = formType.id

    let formProperties = {
        existingSource: true,
        duplicateCheck: '',
        schema: '',
        lockLocation: '',
        formType: formType.dataset.formtype,
        formId: formId,
        formClass: formClass,
        formData: document.querySelector(`#${formId}`)
    }

    formProperties = populateFormInfo(formProperties)
    return formProperties
}
