import { EventDispatcher } from 'three'

export default class BPMManager extends EventDispatcher {
    constructor (audioManager) {
        super()

        this.audioManager = audioManager
        this.bpm = 0
        this.interval = 500
        this.intervalId = null
    }

    setBPM(bpm) {
        this.interval = 60000 / bpm
        clearInterval(this.intervalId)
        this.intervalId = setInterval(this.updateBPM.bind(this), this.interval)
    }

    updateBPM() {
        this.dispatchEvent({ type: 'beat' })
    }

    async detectBPM() {
        const buffer = this.audioManager.audio.buffer
        const audioData = buffer.getChannelData(0)
        const bpm = await guess(audioData)
        this.bpm = bpm
        this.setBPM(bpm)
        console.log(`Detected BPM: ${bpm}`)
    }

    getBPMDuration() {
        return this.interval;
    }
}
