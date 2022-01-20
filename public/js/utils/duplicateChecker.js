import { generateWarning } from './warning'

//TODO: Can it be expanded to work with any record?



export class Duplicate {
    // constructor (title, mediaType, sourceId, type) {
    //     this.title = title
    //     this.mediaType = mediaType || null
    //     this.sourceId = sourceId || null
    //     this.recordType = type
    // }

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

    parseResponse(duplicateSettings) {
        
        for (let field in duplicateSettings.fields) {
            duplicateSettings.fields[field] = document.querySelector(`#${field}`).value
        }
        duplicateSettings.id = this.sourceId
        return this.checkDuplicates(duplicateSettings)
    }

    // async checkDuplicates (duplicateSettings) {
    //     console.log(duplicateSettings)
    //     const response = await fetch('/utils/data?' + new URLSearchParams({
    //         // title: this.title,
    //         // mediaType: this.mediaType,
    //         // sourceId: this.sourceId,
    //         ...duplicateSettings,
    //         recordState: this.recordState
    //     }))
    //     return response.json()
    // }

    async checkDuplicates (duplicateSettings) {
        console.log(this.recordState, 'testsds')
        const response = await fetch('/utils/duplicateCheck', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                duplicateSettings,
                recordState: this.recordState
            })
        })
        // console.log(await response.json(), 'responsetest')
        // return response
        return await response.json()
    }

    // const response = await fetch('/utils/data', {
    //     method: 'PUT',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({
    //         sourceId,
    //         adminNotes: formProperties.formData.adminNotes.value,
    //         state: 'rejected',
    //         collection: formProperties.lockLocation
    //     })
    // })

    async validateDuplicates () {
        // const duplicateResponse = await this.checkDuplicates()

        const duplicateResponse = await this.getRecordProps()
        console.log(duplicateResponse, 'here3')
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