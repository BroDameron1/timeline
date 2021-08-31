// export const checkDuplicates = async (data) => {
//     const response = await fetch('/sources/data?' + new URLSearchParams({
//         title: data.title,
//         mediaType: data.mediaType,
//     }))
//     return response.json()
// }

//Class to help determine if a source has duplicate entries.
//TODO: Can it be expanded to work with any record?
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

//Class for managing record state from the front end
export class StateManager {
    constructor(newState, sourceId, targetCollection) {
        this.newState = newState
        this.sourceId = sourceId
        this.targetCollection = targetCollection
    }

    async retrieveState () {
        const response = await fetch('/sources/data?' + new URLSearchParams({
            sourceId: this.sourceId,
            collection: this.targetCollection
        }))
        const data = await response.json()
        return data.state
    }

    async updateState () {
        const previousState = await this.retrieveState()
        sessionStorage.setItem('previousState', previousState)
        console.log(previousState)
        try {
            const response = await fetch('/sources/data', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    state: this.newState,
                    sourceId: this.sourceId,
                    collection: this.targetCollection
                })
            })
            return response.status
        } catch (err) {
            console.log('Something went wrong.', err)
        }
    }
}

//variables and function for idling out a user while they are editing a record.
const countdown = document.querySelector('.countdown-popup')
const countdownTimer = document.querySelector('.countdown-timer')
const blurBackground = document.querySelector('.disableDiv')
const timerButton = document.querySelector('#timerButton')

const startingMinutes = 1.1 //sets timeout for page
const warningTime = 1 * 60 //sets time when warning will pop up
let time = startingMinutes * 60 //timer for use in idleLogout function, should not change

export const idleLogout = () => { //function for kicking user out of the page if they don't take any action

    const closePopup = () => { //closes the warning popup and resets everything
        countdown.style.display = 'none'
        blurBackground.style.display = 'none'
        time = startingMinutes * 60
    }
    
    const openPopup = () => { //opens a popup at the warning time to tell user they will be kicked out
        countdownTimer.innerHTML = `${minutes}:${seconds}`
        countdown.style.display = 'block'
        blurBackground.style.display = 'block'
        timerButton.addEventListener('click', closePopup)
    }

    const resetTimer = () => {
        if (time > warningTime) {
            time = startingMinutes * 60
        }
    }
    
    const minutes = Math.floor(time / 60)
    let seconds = time % 60
    seconds = seconds < 10 ? '0' + seconds : seconds

    if (time <= warningTime) {
        openPopup()
    }

    if (time <= 0) {
        location.href = '/dashboard'
    }

    console.log(minutes, seconds)
    time--
    window.onload = resetTimer;
    window.onmousemove = resetTimer;
    window.onmousedown = resetTimer;  // catches touchscreen presses as well      
    window.ontouchstart = resetTimer; // catches touchscreen swipes as well 
    window.onclick = resetTimer;      // catches touchpad clicks as well
    window.onkeydown = resetTimer;   
    window.addEventListener('scroll', resetTimer, true); // improved; see comments
}
