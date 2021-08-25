export const checkDuplicates = async (data) => {
    const response = await fetch('/sources/data?' + new URLSearchParams({
        title: data.title,
        mediaType: data.mediaType,
    }))
    return response.json()
}
