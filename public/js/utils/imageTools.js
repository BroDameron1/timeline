
//creates an image preview if a new image is uploaded.

export const imagePreview = () => {
    const sourceImage = document.querySelector('#sourceImage')
    sourceImage.addEventListener('change', event => {
        const imgPreview = document.querySelector('.image-preview')
        const file = document.querySelector('input[type=file]').files[0]
        const reader = new FileReader()

        reader.addEventListener('load', function () {
            imgPreview.src = reader.result
        }, false)

        if (file) {
            reader.readAsDataURL(file)
        }
        document.querySelector('.file-name').textContent = file.name
    })
}