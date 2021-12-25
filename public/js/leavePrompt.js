
const promptCreation = (event) => {
    return event.returnValue = ''
}

export const suppressLeavePrompt = () => {
    window.removeEventListener('beforeunload', promptCreation)
}

export const leavePrompt = () => {
    window.addEventListener('beforeunload', promptCreation)
}

