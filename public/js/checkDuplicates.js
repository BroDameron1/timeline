export const checkDuplicates = async (data) => {
    const response = await fetch('/sources/data?' + new URLSearchParams({
        title: data.title,
        mediaType: data.mediaType,
    }))
    return response.json()
}

export class Duplicate {
    constructor (title, mediaType, sourceId) {
        this.title = title
        this.mediaType = mediaType
        this.sourceId = sourceId || null
    }

    async checkDuplicates (collection) {
        const response = await fetch('/sources/data?' + new URLSearchParams({
            title: this.title,
            mediaType: this.mediaType,
            sourceId: this.sourceId,
            collection
        }))
        return response.json()
    }

    async checkPublicDuplicates () {
        const duplicateResponse = await this.checkDuplicates('public')
        if (!duplicateResponse) return true
        //TODO: Fix this so it will properly display a link.
        return `That record already exists. ${duplicateResponse.title}, ${duplicateResponse._id}`
    }

    async checkBothDuplicates () {
        const duplicateResponse = await this.checkDuplicates('both')
        if (!duplicateResponse) return true
        if (duplicateResponse.title) {
            return `That record already exists. ${duplicateResponse.title}, ${duplicateResponse._id}`
        } else {
            return `A record with that title is already under review.`
        }
    }
}

