import { rejectPublish } from "./rejectPublish";



const populateFormInfo = (formProperties) => {
    
    switch (formProperties.formClass) {
        case 'sourceForm':
            formProperties.schema = 'sourceSchema'
            switch (formProperties.formId) {
                case 'newSource':
                    formProperties.existingSource = false
                    formProperties.duplicateCheck = 'submitNew'
                break;
                case 'updateReviewSource':
                    formProperties.duplicateCheck = 'updateReview'
                    formProperties.lockLocation = 'ReviewSource'
                break;
                case 'publishSource':
                    formProperties.duplicateCheck = 'publishRecord'
                    formProperties.lockLocation = 'ReviewSource'
                    rejectPublish(formProperties.lockLocation, formProperties.formId)
                break;
                case 'updatePublicSource':
                    formProperties.duplicateCheck = 'editPublic'
                    formProperties.lockLocation = 'PublicSource'
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







// export const identifyForm = () => {
//     // const formType = document.querySelector('[data-formtype]')
//     // const formId = formType.id
//     let formProperties = gatherFormInfo()


//     switch (formProperties.formType) {
//         case 'newSubmission':
//             formProperties.existingSource = false
//         break;
//         case 'publishSubmission':

//         break;
//         case 'updatePublicSubmission':
//         break;
//         case 'updateReviewSubmission':
//         break;
//     }

//     // switch (formStuff.dataset.formtype) {
//     //     case 'newSubmission':
//     //         formStuff.existingSource = false
//     //         console.log('test1')
//     //     break;
//     //     case 'publishSubmission':
//     //         formStuff.existingSource = true
//     //         console.log('test2')
//     //         rejectPublish('ReviewSource', formId)
//     //     break;
//     //     case 'updatePublicSubmission':
//     //         formStuff.existingSource = true
//     //         console.log('test3')
//     //     break;
//     //     case 'updateReviewSubmission':
//     //         formStuff.existingSource = true
//     //         console.log('test4')
//     //     break;
//     // }

// }

