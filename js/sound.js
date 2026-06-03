// sound.js — АКУСТИЧНЕ ФОРТЕПІАНО ТА СИСТЕМА ФІНАЛУ ГРИ
import { gameState } from './config.js';

let audioCtx = null;
let laserOsc = null;
let laserGain = null;

export let isMuted = false;
export let isMusicMuted = false;

let musicInterval = null;
let currentNoteIndex = 0;

const pianoMelody = [
    261.63, 392.00, 523.25, 392.00, // C
    329.63, 392.00, 523.25, 392.00,
    220.00, 329.63, 440.00, 329.63, // Am
    340.00, 329.63, 440.00, 329.63,
    293.66, 440.00, 587.33, 440.00, // Dm
    349.23, 440.00, 587.33, 440.00,
    196.00, 293.66, 392.00, 293.66, // G
    392.00, 493.88, 587.33, 493.88
];

export function toggleMute() {
    isMuted = !isMuted;
    if (isMuted && laserGain) {
        laserGain.gain.value = 0;
    }
    return isMuted;
}

export function toggleMusic() {
    isMusicMuted = !isMusicMuted;
    if (isMusicMuted) {
        stopMusicLoop();
    } else {
        startMusicLoop();
    }
    return isMusicMuted;
}

export function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    startLaserHum();
    startMusicLoop();
}

function startLaserHum() {
    if (isMuted || !audioCtx) return;

    laserOsc = audioCtx.createOscillator();
    laserGain = audioCtx.createGain();

    laserOsc.type = 'sine';
    laserOsc.frequency.value = 90;

    let filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 100;

    laserGain.gain.value = 0;

    laserOsc.connect(filter);
    filter.connect(laserGain);
    laserGain.connect(audioCtx.destination);

    laserOsc.start();
}

export function updateLaserSound(lineX) {
    if (!audioCtx || isMuted || !laserGain || !laserOsc) return;

    if (gameState.gameStarted && !gameState.isGameOver && !gameState.isWaitingForNextLevel && !gameState.isFrozen) {
        laserGain.gain.setValueAtTime(0.015, audioCtx.currentTime);
        let freq = 80 + (lineX / 4);
        laserOsc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    } else {
        laserGain.gain.setValueAtTime(0, audioCtx.currentTime);
    }
}

export function startMusicLoop() {
    if (isMusicMuted || !audioCtx || musicInterval || gameState.isGameOver) return;

    musicInterval = setInterval(() => {
        playPianoNote(pianoMelody[currentNoteIndex]);
        currentNoteIndex = (currentNoteIndex + 1) % pianoMelody.length;
    }, 450);
}

export function stopMusicLoop() {
    if (musicInterval) {
        clearInterval(musicInterval);
        musicInterval = null;
    }
}

function playPianoNote(frequency) {
    if (!audioCtx || isMusicMuted) return;

    let gainNode = audioCtx.createGain();
    let filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, audioCtx.currentTime);

    for (let i = 1; i <= 3; i++) {
        let osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency * i, audioCtx.currentTime);

        let oscGain = audioCtx.createGain();
        oscGain.gain.setValueAtTime(i === 1 ? 0.04 : 0.01 / i, audioCtx.currentTime);

        osc.connect(oscGain);
        oscGain.connect(filter);

        osc.start();
        osc.stop(audioCtx.currentTime + 1.8);
    }

    let hammer = audioCtx.createOscillator();
    let hammerGain = audioCtx.createGain();
    hammer.type = 'triangle';
    hammer.frequency.setValueAtTime(1200, audioCtx.currentTime);
    hammerGain.gain.setValueAtTime(0.008, audioCtx.currentTime);
    hammerGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.02);
    hammer.connect(hammerGain);
    hammerGain.connect(audioCtx.destination);
    hammer.start();
    hammer.stop(audioCtx.currentTime + 0.02);

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.8);

    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
}

// РЕТРО SCI-FI ЗВУК ПОСТРІЛУ БЛАСТЕРА («П'юююіііуууу»)
export function playPerfectCutSound() {
    if (!audioCtx || isMuted) return;

    let now = audioCtx.currentTime;
    let duration = 0.24; // Швидкий, енергійний постріл

    let osc1 = audioCtx.createOscillator();
    let osc2 = audioCtx.createOscillator();
    let gainNode = audioCtx.createGain();
    let filter = audioCtx.createBiquadFilter();

    // Пилкова хвиля дає той самий «електронний лазерний тріск», а синусоїда згладжує його основи
    osc1.type = 'sawtooth';
    osc2.type = 'sine';

    // Стрімке падіння частоти бластера (ефект пострілу)
    osc1.frequency.setValueAtTime(1600, now);
    osc1.frequency.exponentialRampToValueAtTime(90, now + duration);

    // Другий шар додає звуку об'єму та щільності
    osc2.frequency.setValueAtTime(800, now);
    osc2.frequency.exponentialRampToValueAtTime(45, now + duration);

    // Фільтр зрізає занадто їдкі високі частоти пилковій хвилі, залишаючи звук приємним
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + duration);

    // Гучність: миттєва потужна атака (постріл) і швидкий хвіст згасання
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.22, now + 0.005); // Надшвидкий спалах
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // З'єднуємо вузли
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc1.start(now);
    osc2.start(now);

    osc1.stop(now + duration);
    osc2.stop(now + duration);
}

// М'який глухий звук промаху
export function playWrongCutSound() {
    if (!audioCtx || isMuted) return;

    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, audioCtx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

    let filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 180;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
}

// Фінальна мелодія програшу
export function playGameOverMusic() {
    stopMusicLoop();
    if (!audioCtx || isMusicMuted) return;

    const gameOverNotes = [196.00, 233.08, 293.66];

    gameOverNotes.forEach((freq, index) => {
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        let filter = audioCtx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + (index * 0.1));
        osc.frequency.linearRampToValueAtTime(freq - 30, audioCtx.currentTime + (index * 0.1) + 2.0);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, audioCtx.currentTime);

        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + (index * 0.1) + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 2.5);
    });
}