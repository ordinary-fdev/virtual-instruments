const STATE = {
    particles: [],
    sustainPedal: false,
    tutorialMode: false,
    currentStep: 0,
    currentInstrument: 'piano',
    activeNotes: new Set()
}

const INSTRUMENT_COLORS = {
    piano: '#d4af37',
    violin: '#ff3b3b',
    harmonium: '#ff8c00',
    flute: '#00f2ff',
    saxophone: '#d400ff',
    guitar: '#00ff88',
    organ: '#ffcc00',
    bassGuitar: '#5d26ff',
    xylophone: '#7c4dff',
    bells: '#66ccff',
    synth: '#ff66cc'
}

const INSTRUMENT_HOTKEYS = {
    '1': 'piano',
    '2': 'guitar',
    '3': 'flute',
    '4': 'violin',
    '5': 'bassGuitar',
    '6': 'harmonium',
    '7': 'saxophone',
}

const physicsWorker = new Worker('particleWorker.js');

physicsWorker.onmessage = (e) => {
    if (e.data.type === 'STATE') {
        STATE.particles = e.data.particles;
    }
};

class AudioEngine {
    constructor() {
        Tone.context.lookAhead = 0.01
        this.reverb = new Tone.Reverb({ decay: 1.0, wet: 0.15 }).toDestination()
        
        const sampleBaseUrl = "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/"
        this.instruments = {
            piano: new Tone.Sampler({
                urls: {
                    "A0": "A0.mp3", "C1": "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3",
                    "A1": "A1.mp3", "C2": "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3",
                    "A2": "A2.mp3", "C3": "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3",
                    "A3": "A3.mp3", "C4": "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3",
                    "A4": "A4.mp3", "C5": "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
                    "A5": "A5.mp3", "C6": "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3",
                    "A6": "A6.mp3", "C7": "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3",
                    "A7": "A7.mp3", "C8": "C8.mp3"
                },
                release: 1,
                baseUrl: "https://tonejs.github.io/audio/salamander/",
                onload: () => { console.log("Piano loaded"); }
            }).connect(this.reverb),

            violin: new Tone.Sampler({
                urls: { "A3": "A3.mp3", "A4": "A4.mp3", "A5": "A5.mp3", "A6": "A6.mp3", "C4": "C4.mp3", "C5": "C5.mp3", "C6": "C6.mp3", "C7": "C7.mp3", "E4": "E4.mp3", "E5": "E5.mp3", "E6": "E6.mp3", "G4": "G4.mp3", "G5": "G5.mp3", "G6": "G6.mp3" },
                baseUrl: sampleBaseUrl + "violin/",
                release: 1
            }).connect(this.reverb),

            harmonium: new Tone.Sampler({
                urls: { "C2": "C2.mp3", "C3": "C3.mp3", "C4": "C4.mp3", "C5": "C5.mp3", "C#2": "Cs2.mp3", "C#3": "Cs3.mp3", "C#4": "Cs4.mp3", "C#5": "Cs5.mp3", "D2": "D2.mp3", "D3": "D3.mp3", "D4": "D4.mp3", "D5": "D5.mp3", "D#2": "Ds2.mp3", "D#3": "Ds3.mp3", "D#4": "Ds4.mp3", "E2": "E2.mp3", "E3": "E3.mp3", "E4": "E4.mp3", "F2": "F2.mp3", "F3": "F3.mp3", "F4": "F4.mp3", "F#2": "Fs2.mp3", "F#3": "Fs3.mp3", "G2": "G2.mp3", "G3": "G3.mp3", "G4": "G4.mp3", "G#2": "Gs2.mp3", "G#3": "Gs3.mp3", "G#4": "Gs4.mp3", "A2": "A2.mp3", "A3": "A3.mp3", "A4": "A4.mp3", "A#2": "As2.mp3", "A#3": "As3.mp3", "A#4": "As4.mp3" },
                baseUrl: sampleBaseUrl + "harmonium/",
                release: 1
            }).connect(this.reverb),

            flute: new Tone.Sampler({
                urls: { "A6": "A6.mp3", "C4": "C4.mp3", "C5": "C5.mp3", "C6": "C6.mp3", "C7": "C7.mp3", "E4": "E4.mp3", "E5": "E5.mp3", "E6": "E6.mp3", "A4": "A4.mp3", "A5": "A5.mp3" },
                baseUrl: sampleBaseUrl + "flute/",
                release: 1
            }).connect(this.reverb),

            saxophone: new Tone.Sampler({
                urls: { "D#5": "Ds5.mp3", "E3": "E3.mp3", "E4": "E4.mp3", "E5": "E5.mp3", "F3": "F3.mp3", "F4": "F4.mp3", "F5": "F5.mp3", "F#3": "Fs3.mp3", "F#4": "Fs4.mp3", "F#5": "Fs5.mp3", "G3": "G3.mp3", "G4": "G4.mp3", "G5": "G5.mp3", "G#3": "Gs3.mp3", "G#4": "Gs4.mp3", "G#5": "Gs5.mp3", "A4": "A4.mp3", "A5": "A5.mp3", "A#3": "As3.mp3", "A#4": "As4.mp3", "B3": "B3.mp3", "B4": "B4.mp3", "C4": "C4.mp3", "C5": "C5.mp3", "C#3": "Cs3.mp3", "C#4": "Cs4.mp3", "C#5": "Cs5.mp3", "D3": "D3.mp3", "D4": "D4.mp3", "D5": "D5.mp3", "D#3": "Ds3.mp3", "D#4": "Ds4.mp3" },
                baseUrl: sampleBaseUrl + "saxophone/",
                release: 1
            }).connect(this.reverb),

            guitar: new Tone.Sampler({
                urls: { "F4": "F4.mp3", "F#2": "Fs2.mp3", "F#3": "Fs3.mp3", "F#4": "Fs4.mp3", "G2": "G2.mp3", "G3": "G3.mp3", "G4": "G4.mp3", "G#2": "Gs2.mp3", "G#3": "Gs3.mp3", "G#4": "Gs4.mp3", "A2": "A2.mp3", "A3": "A3.mp3", "A4": "A4.mp3", "A#2": "As2.mp3", "A#3": "As3.mp3", "A#4": "As4.mp3", "B2": "B2.mp3", "B3": "B3.mp3", "B4": "B4.mp3", "C3": "C3.mp3", "C4": "C4.mp3", "C5": "C5.mp3", "C#3": "Cs3.mp3", "C#4": "Cs4.mp3", "C#5": "Cs5.mp3", "D2": "D2.mp3", "D3": "D3.mp3", "D4": "D4.mp3", "D5": "D5.mp3", "D#2": "Ds2.mp3", "D#3": "Ds3.mp3", "D#4": "Ds3.mp3", "E2": "E2.mp3", "E3": "E3.mp3", "E4": "E4.mp3", "F2": "F2.mp3", "F3": "F3.mp3" },
                baseUrl: sampleBaseUrl + "guitar-acoustic/",
                release: 1
            }).connect(this.reverb),

            organ: new Tone.Sampler({
                urls: { "C3": "C3.mp3", "C4": "C4.mp3", "C5": "C5.mp3", "C6": "C6.mp3", "D#1": "Ds1.mp3", "D#2": "Ds2.mp3", "D#3": "Ds3.mp3", "D#4": "Ds4.mp3", "D#5": "Ds5.mp3", "F#1": "Fs1.mp3", "F#2": "Fs2.mp3", "F#3": "Fs3.mp3", "F#4": "Fs4.mp3", "F#5": "Fs5.mp3", "A1": "A1.mp3", "A2": "A2.mp3", "A3": "A3.mp3", "A4": "A4.mp3", "A5": "A5.mp3", "C1": "C1.mp3", "C2": "C2.mp3" },
                baseUrl: sampleBaseUrl + "organ/",
                release: 1
            }).connect(this.reverb),

            xylophone: new Tone.Sampler({
                urls: { "C8": "C8.mp3", "G4": "G4.mp3", "G5": "G5.mp3", "G6": "G6.mp3", "G7": "G7.mp3", "C5": "C5.mp3", "C6": "C6.mp3", "C7": "C7.mp3" },
                baseUrl: sampleBaseUrl + "xylophone/",
                release: 1
            }).connect(this.reverb),

            bassGuitar: new Tone.Sampler({
                urls: { "A#1": "As1.mp3", "A#2": "As2.mp3", "A#3": "As3.mp3", "A#4": "As4.mp3", "C#1": "Cs1.mp3", "C#2": "Cs2.mp3", "C#3": "Cs3.mp3", "C#4": "Cs4.mp3", "E1": "E1.mp3", "E2": "E2.mp3", "E3": "E3.mp3", "E4": "E4.mp3", "G1": "G1.mp3", "G2": "G2.mp3", "G3": "G3.mp3", "G4": "G4.mp3" },
                baseUrl: sampleBaseUrl + "bass-electric/",
                release: 1
            }).connect(this.reverb),

            synth: new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'sine' },
                envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.5 }
            }).connect(this.reverb)
        }

        this.currentInstrument = this.instruments.piano
    }

    switchInstrument(instrumentName) {
        if (this.instruments[instrumentName]) {
            this.currentInstrument = this.instruments[instrumentName]
            console.log(`Switched to ${instrumentName}`)
            
            // Update Dynamic Colors
            const color = INSTRUMENT_COLORS[instrumentName] || '#ffffff'
            document.documentElement.style.setProperty('--accent', color)
            
            // Update UI Labels
            const label = document.getElementById('currentInstrumentLabel')
            if (label) {
                const nameElement = document.querySelector(`.instrument-card[data-instrument="${instrumentName}"] h3`)
                label.innerText = nameElement ? nameElement.innerText : instrumentName
            }

            const playingLabel = document.getElementById('instrumentPlaying')
            if (playingLabel) {
                const nameElement = document.querySelector(`.instrument-card[data-instrument="${instrumentName}"] h3`)
                playingLabel.innerText = nameElement ? nameElement.innerText : instrumentName
            }

            // Update Background Glow
            const bgGlow = document.getElementById('backgroundGlow')
            if (bgGlow) {
                bgGlow.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`
            }

            // Update status message when instrument changes
            const status = document.getElementById('status')
            if (status) {
                status.innerText = `Instrument: ${label ? label.innerText : instrumentName}`
            }
        }
    }

    async start() { await Tone.start() }
    
    play(note, velocity = 0.8) { 
        if (this.currentInstrument.loaded === false) return
        this.currentInstrument.triggerAttack(note, Tone.now(), velocity)
    }
    
    release(note) { 
        if (this.currentInstrument.loaded === false) return
        this.currentInstrument.triggerRelease(note, Tone.now())
    }

    releaseAll() {
        this.currentInstrument.triggerRelease()
    }
}

let audioReady = false
async function startAudio() {
    if (audioReady) return
    await audio.start()
    audioReady = true
}

function initializePedal() {
    window.addEventListener('keydown', e => {
        if (e.code === 'Space') {
            STATE.sustainPedal = true
            document.getElementById('status').innerText = 'Sustain Pedal Active'
        }
    })
    window.addEventListener('keyup', e => {
        if (e.code === 'Space') {
            STATE.sustainPedal = false
            document.getElementById('status').innerText = STATE.tutorialMode ? 'Learn: Kal Ho Naa Ho' : 'Press keys to play'
            audio.releaseAll()
        }
    })
}

class Renderer {
    constructor(canvas) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')
        this.resize()
        window.addEventListener('resize', () => this.resize())
    }
    resize() { this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight; }
    render() { this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); }
}

const NOTES = [
    { note: 'C4', type: 'white' }, { note: 'Db4', type: 'black' }, { note: 'D4', type: 'white' },
    { note: 'Eb4', type: 'black' }, { note: 'E4', type: 'white' }, { note: 'F4', type: 'white' },
    { note: 'Gb4', type: 'black' }, { note: 'G4', type: 'white' }, { note: 'Ab4', type: 'black' },
    { note: 'A4', type: 'white' }, { note: 'Bb4', type: 'black' }, { note: 'B4', type: 'white' },
    { note: 'C5', type: 'white' }, { note: 'Db5', type: 'black' }, { note: 'D5', type: 'white' },
    { note: 'Eb5', type: 'black' }, { note: 'E5', type: 'white' }, { note: 'F5', type: 'white' },
    { note: 'Gb5', type: 'black' }, { note: 'G5', type: 'white' }, { note: 'Ab5', type: 'black' },
    { note: 'A5', type: 'white' }, { note: 'Bb5', type: 'black' }, { note: 'B5', type: 'white' }
]

const KEYBOARD_MAP = {
    a: 'C4', w: 'Db4', s: 'D4', e: 'Eb4', d: 'E4', f: 'F4',
    t: 'Gb4', g: 'G4', y: 'Ab4', h: 'A4', u: 'Bb4', j: 'B4',
    k: 'C5', o: 'Db5', l: 'D5', p: 'Eb5', ';': 'E5', "'": 'F5'
}

const visualCanvas = document.getElementById('visualCanvas')
const renderer = new Renderer(visualCanvas)
const audio = new AudioEngine()

function createParticles(note) {
    const keys = document.querySelectorAll('.key')
    let targetX = window.innerWidth / 2
    keys.forEach(key => { if (key.dataset.note === note) { const rect = key.getBoundingClientRect(); targetX = rect.left + rect.width / 2; } })
    
    // Use dynamic instrument color for particles
    const baseColor = INSTRUMENT_COLORS[STATE.currentInstrument] || '#ffffff'
    const color = note.includes('b') ? '#ffffff' : baseColor
    
    // Increase particle count based on how many notes are active (Chord multiplier)
    const chordSize = STATE.activeNotes.size
    const baseBurst = 8
    const multiplier = chordSize > 2 ? 3 : (chordSize > 1 ? 2 : 1)
    const particleCount = baseBurst * multiplier
    
    for (let i = 0; i < particleCount; i++) {
        // Add more randomness to velocity for chord bursts
        const velocityScale = chordSize > 2 ? 1.5 : 1.0
        physicsWorker.postMessage({ 
            type: 'SPAWN', 
            data: { 
                x: targetX, 
                y: window.innerHeight - 100, 
                color,
                vx: (Math.random() - 0.5) * 10 * velocityScale,
                vy: (Math.random() * -15 - 5) * velocityScale
            } 
        });
    }
}

function updateTutorialUI() {
    const tutorialPanel = document.getElementById('tutorialPanel')
    if (!tutorialPanel) return
    const step = TUTORIAL_SONG[STATE.currentStep]
    tutorialPanel.innerHTML = `
        <div class="tutorial-card">
            <span class="next-label">PLAY NEXT</span>
            <h2 class="tutorial-note">${step.note}</h2>
            <p class="tutorial-text">${step.text || '...'}</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(STATE.currentStep / TUTORIAL_SONG.length) * 100}%"></div>
            </div>
        </div>
    `
    document.querySelectorAll('.key').forEach(k => k.classList.remove('target'))
    const targetKey = document.querySelector(`.key[data-note="${step.note}"]`)
    if (targetKey) targetKey.classList.add('target')
}

function activateKey(note) {
    STATE.activeNotes.add(note)
    if (STATE.tutorialMode && note === TUTORIAL_SONG[STATE.currentStep].note) {
        STATE.currentStep = (STATE.currentStep + 1) % TUTORIAL_SONG.length
        updateTutorialUI()
    }
    document.querySelectorAll('.key').forEach(key => {
        if (key.dataset.note === note) {
            key.classList.add('active')
            createParticles(note)
            const beam = document.createElement('div')
            beam.className = 'key-beam'
            key.appendChild(beam)
            const bgGlow = document.getElementById('backgroundGlow')
            if (bgGlow) {
                const color = INSTRUMENT_COLORS[STATE.currentInstrument] || '#ffffff'
                bgGlow.style.opacity = '0.4'
                bgGlow.style.background = `radial-gradient(circle, ${color}33, transparent 70%)`
            }
        }
    })
}

function deactivateKey(note) {
    STATE.activeNotes.delete(note)
    document.querySelectorAll('.key').forEach(key => {
        if (key.dataset.note === note) {
            key.classList.remove('active')
            key.querySelectorAll('.key-beam').forEach(b => b.remove())
            const bgGlow = document.getElementById('backgroundGlow')
            if (bgGlow) bgGlow.style.opacity = '0.2'
        }
    })
}

function buildKeyboard() {
    const piano = document.getElementById('piano')
    piano.innerHTML = ''
    NOTES.forEach(noteData => {
        const key = document.createElement('div')
        key.className = `key ${noteData.type}`
        key.dataset.note = noteData.note
        const label = document.createElement('span')
        label.textContent = noteData.note
        key.appendChild(label)
        key.addEventListener('pointerdown', (e) => {
            e.preventDefault(); key.releasePointerCapture(e.pointerId);
            if (!audioReady) startAudio(); audio.play(noteData.note, 0.8); activateKey(noteData.note);
        })
        key.addEventListener('pointerenter', (e) => { if (e.buttons === 1) { audio.play(noteData.note, 0.7); activateKey(noteData.note); } })
        key.addEventListener('pointerup', () => { if (!STATE.sustainPedal) audio.release(noteData.note); deactivateKey(noteData.note); })
        key.addEventListener('pointerleave', (e) => { if (e.buttons === 1) { if (!STATE.sustainPedal) audio.release(noteData.note); deactivateKey(noteData.note); } })
        piano.appendChild(key)
    })
}

function frameLoop() {
    const ctx = renderer.ctx
    renderer.render()
    physicsWorker.postMessage({ type: 'UPDATE' });
    STATE.particles.forEach(p => {
        ctx.save(); ctx.globalAlpha = p.life; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.shadowBlur = 15; ctx.shadowColor = p.color; ctx.fill(); ctx.restore();
    })
    requestAnimationFrame(frameLoop)
}

window.addEventListener('keydown', async e => {
    if (!audioReady) await startAudio()
    if (e.repeat) return

    const hotkey = INSTRUMENT_HOTKEYS[e.key]
    if (hotkey) {
        STATE.currentInstrument = hotkey
        audio.switchInstrument(hotkey)
        document.querySelectorAll('.instrument-card').forEach(c => c.classList.toggle('active', c.dataset.instrument === hotkey))
        return
    }

    const note = KEYBOARD_MAP[e.key]
    if (!note) return
    audio.play(note, 0.8)
    activateKey(note)
})

window.addEventListener('keyup', e => {
    const note = KEYBOARD_MAP[e.key]
    if (!note) return
    audio.release(note)
    deactivateKey(note)
})

initializePedal()
buildKeyboard()
function initialize() {
    // Create Tutorial UI (Hidden by default)
    const tutorialUI = document.createElement('div')
    tutorialUI.id = 'tutorialPanel'
    tutorialUI.style.display = 'none'
    document.body.appendChild(tutorialUI)

    // Modal Control
    const modal = document.getElementById('instrumentModal')
    const openBtn = document.getElementById('openInstrumentModal')
    const closeBtn = document.getElementById('closeModal')

    openBtn.addEventListener('click', () => modal.classList.add('open'))
    closeBtn.addEventListener('click', () => modal.classList.remove('open'))
    
    // Close on click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open')
    })

    // Instrument Selection
    document.querySelectorAll('.instrument-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.instrument-card').forEach(c => c.classList.remove('active'))
            card.classList.add('active')
            
            const instrument = card.dataset.instrument
            STATE.currentInstrument = instrument
            audio.switchInstrument(instrument)
            
            // Close modal after selection
            setTimeout(() => modal.classList.remove('open'), 300)
        })
    })

    document.getElementById('status').innerText = 'Press keys to play'
    frameLoop()
}

function toggleTutorial() {
    STATE.tutorialMode = !STATE.tutorialMode
    const panel = document.getElementById('tutorialPanel')
    const btnText = document.getElementById('learnToggle')
    
    if (STATE.tutorialMode) {
        panel.style.display = 'block'
        btnText.innerText = 'Exit Lesson'
        document.getElementById('status').innerText = 'Learn: Kal Ho Naa Ho'
        updateTutorialUI()
    } else {
        panel.style.display = 'none'
        btnText.innerText = 'Learn Song'
        document.getElementById('status').innerText = 'Press keys to play'
        document.querySelectorAll('.key').forEach(k => k.classList.remove('target'))
    }
}
initialize()
