import * as THREE from 'three';

export default class AudioManager {
    constructor() {
        this.isPlaying = false;

        this.fftSize = 2048; // length of the data array

        // Filters
        this.lowFreq = 5;
        this.midFreq = 150;
        this.highFreq = 1000;
        
        this.frequencyArray = []; // raw frequency data
        this.frequencyData = { // filtered frequency data
            low: 0,
            mid: 0,
            high: 0
        }
        

        this.thresholds = {
            highest: 91,
            high: 90,
            medium: 89
        }
        this.thresholdMin = {
            highest: 88, 
            high: 80,
            medium: 75
        }
        this.thresholdMax = {
            highest: 100,
            high: 98,
            medium: 95
        }
        this.thresholdRate = 0.1;


        // Audio
        this.audioAnalyser = null; // three.js audio analyser
        this.audioListener = null; // three.js audio listener
        this.audioContext = null; // web thingy for audio fx graph
        this.audio = null; // audio element

        this.smoothingTimeConstant = 0.8; // how smooth the data is

        // Song
        this.song = {
            url: "./static/songs/Linkin Park Track 6.mp3",
            title: "Easier to Run",
            artist: "Linkin Park",
            album: "Meteora",
            albumCover: "./static/album-covers/meteora.jpg",
            duration: 0
        }
    }

    onHit(type) {
        console.log('hit : ', type);
        console.log(this.pad(Math.round(this.thresholds.highest), 2), this.pad(Math.round(this.thresholds.high), 2), this.pad(Math.round(this.thresholds.medium), 2));
        if (type === 'highest') {
            this.thresholds.highest = this.thresholdMax.highest;
        } else if (type === 'high') {
            this.thresholds.high = this.thresholdMax.high;
        } else if (type === 'medium') {
            this.thresholds.medium = this.thresholdMax.medium;
        }
        console.log(this.pad(Math.round(this.thresholds.highest), 2), this.pad(Math.round(this.thresholds.high), 2), this.pad(Math.round(this.thresholds.medium), 2));
    }

    lowerThresholds() {
        for (let key in this.thresholds) {
            this.thresholds[key] -= this.thresholdRate;
            if (this.thresholds[key] < this.thresholdMin[key]) {
                this.thresholds[key] = this.thresholdMin[key];
            }
        }
        //console.log(this.pad(Math.round(this.thresholds.highest), 2), this.pad(Math.round(this.thresholds.high), 2), this.pad(Math.round(this.thresholds.medium), 2));
    }

    async loadAudio() {
        return new Promise((resolve, reject) => {
            this.audioListener = new THREE.AudioListener();
            this.audio = new THREE.Audio(this.audioListener);
            // create fft
            this.audioAnalyser = new THREE.AudioAnalyser(this.audio, this.fftSize);

            // set smoothing
            this.audioAnalyser.analyser.smoothingTimeConstant = this.smoothingTimeConstant;

            // load audio
            const audioLoader = new THREE.AudioLoader();
            audioLoader.load(
                this.song.url, 
                (buffer) => {
                    this.audio.setBuffer(buffer);
                    this.audio.setLoop(true);
                    this.audio.setVolume(0.5);
                    this.audioContext = this.audio.context;
                    this.song.duration = String(Math.floor(buffer.duration/60) + ":" + Math.floor(buffer.duration%60));
                    resolve();
                },
                undefined,
                reject
            );
        });
    }

    collectFrequencyData() {
        this.frequencyArray = this.audioAnalyser.getFrequencyData();
    }

    getFrequencyValue(frequency) {
        const nyquist = this.audioContext.sampleRate / 2;
        const index = Math.round((frequency / nyquist) * (this.fftSize / 2));
        return this.frequencyArray[index] || 0;
    }

    analyseFrequencyData() {
        if (!this.audioContext || !this.frequencyArray.length) return;

        // Calculate frequency ranges using logarithmic scale for better distribution
        const fftScale = (freq) => {
            return Math.round((freq / this.audioContext.sampleRate) * this.fftSize);
        };

        const ranges = {
            low: {
                start: fftScale(this.lowFreq),
                end: fftScale(this.midFreq)
            },
            mid: {
                start: fftScale(this.midFreq),
                end: fftScale(this.highFreq)
            },
            high: {
                start: fftScale(this.highFreq),
                end: this.fftSize / 2
            }
        };

        //console.log(ranges);

        // calculate average for each range
        Object.keys(ranges).forEach((range) => {
            const { start, end } = ranges[range];
            let sum = 0;
            let peak = 0;
            let count = 0;

            for (let i = start; i < end; i++) {
                const value = this.frequencyArray[i];
                if (value > peak) peak = value;
                sum += value;
                count++;
            }
            const average = sum / count;
            const result = (average * 0.9 + peak * 0.1);
            this.frequencyData[range] = this.normaliseValue(result);
        });
        //console.log(this.pad(Math.round(this.frequencyData.low * 100), 2), this.pad(Math.round(this.frequencyData.mid * 100), 2), this.pad(Math.round(this.frequencyData.high * 100), 2));
    }

    pad(num, size) { // make it two digits
        let s = num + "";
        while (s.length < size) s = "0" + s;
        return s;
    }

    getFrequencyBand(startFreq, endFreq) {
        const startIndex = Math.floor(startFreq * this.fftSize / this.audioContext.sampleRate);
        const endIndex = Math.floor(endFreq * this.fftSize / this.audioContext.sampleRate);
        let sum = 0;
        let count = 0;

        for (let i = startIndex;  i<= endIndex && i < this.frequencyArray.length; i++) {
            sum += this.frequencyArray[i];
            count++;
        }

        return count > 0 ? sum / count : 0;
    }

    normaliseValue(value) {
        return Math.min(1, Math.max(0, value / 255));
    }

    update() {
        if (!this.isPlaying) return;
        this.collectFrequencyData();
        this.analyseFrequencyData();
        this.lowerThresholds();
    }

    play() {
        if(!this.audio && !this.audio.buffer) return;
        this.audio.play();
        this.isPlaying = true;
    }

    pause() {
        if(!this.audio) return;
        this.audio.pause();
        this.isPlaying = false;
    }
}