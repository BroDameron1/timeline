import { generateWarning } from './warning'



export class Duplicate {
    constructor (recordType, sourceId, recordState) {
        this.recordType = recordType
        this.sourceId = sourceId
        this.recordState = recordState
    }

    async getRecordProps () {
        const response = await fetch('/utils/recordProps?' + new URLSearchParams({
            recordType: this.recordType
        }))
        return this.parseResponse(await response.json())
    }

    parseResponse(recordProps) { //TODO: Figure out how to handle and passthrough nested objects from the db model
        for (let field in recordProps.duplicateFields) {
            recordProps.duplicateFields[field] = document.querySelector(`#${field}`).value
        }
        recordProps.id = this.sourceId
        return this.checkDuplicates(recordProps)
    }

    async checkDuplicates (recordProps) {
        const response = await fetch('/utils/duplicateCheck', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                recordProps,
                recordState: this.recordState
            })
        })
        return await response.json()
    }

    async validateDuplicates () {
        const duplicateResponse = await this.getRecordProps()
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