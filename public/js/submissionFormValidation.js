//validates the form entry for record submission against the same backend Joi validations

import serialize from 'form-serialize-improved'
import { sourceSchema } from '../../schemas'
import { generateWarning } from './warning'

export const formValidation = (formData, schema) => {
    const serializedData = serialize(formData, {hash: true })
    const { error } = sourceSchema.validate(serializedData, { abortEarly: false })
    if (error) {
        for (let errorDetails of error.details) {
            let invalidFieldName = errorDetails.path
            if (invalidFieldName.length === 2) {
                invalidFieldName = `${invalidFieldName[0]}-${invalidFieldName[1]}`
            } else if (invalidFieldName.length === 3) {
                //TODO: Add zero to field names in HTML so if statement can be removed
                invalidFieldName = `${invalidFieldName[0]}-${invalidFieldName[1]}${invalidFieldName[2]}`
            }
            generateWarning(errorDetails.message, invalidFieldName)
        }
        return true
    }
    return false
}