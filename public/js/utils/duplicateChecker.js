import { generateWarning } from './warning'

//TODO: Can it be expanded to work with any record?
export class Duplicate {
    constructor (title, mediaType, sourceId, type) {
        this.title = title
        this.mediaType = mediaType || null
        this.sourceId = sourceId || null
        this.type = type
    }
    async checkDuplicates () {
        const response = await fetch('/utils/data?' + new URLSearchParams({
            title: this.title,
            mediaType: this.mediaType,
            sourceId: this.sourceId,
            type: this.type
        }))
        return response.json()
    }

    async validateDuplicates () {
        const duplicateResponse = await this.checkDuplicates()
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