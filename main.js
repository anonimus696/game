// main.js — СИНХРОНІЗАЦІЯ ІНТЕРФЕЙСУ ТА КЕРУВАННЯ
import { gameState } from './js/config.js';
import { getLeaderboard } from './js/leaderboard.js';
import { initPlayerSession, restartGame, handleCut, updateLoop } from './js/game.js';
import { initAudio, toggleMute, toggleMusic } from './js/sound.js';

let ui = {};

document.addEventListener('DOMContentLoaded', () => {

    ui = {
        canvas: document.getElementById('gameCanvas'),
        scoreVal: document.getElementById('score-val'),
        highscoreVal: document.getElementById('highscore-val'),
        highscoreWrap: document.getElementById('highscore-wrap'),
        livesDisplay: document.getElementById('lives'),
        statusMsg: document.getElementById('status-msg'),
        percentDisplay: document.getElementById('percent-display'),
        menu: document.getElementById('menu'),
        gameUi: document.getElementById('game-ui'),
        startBtn: document.getElementById('start-btn'),
        nicknameInput: document.getElementById('nickname-input'),
        leaderboardList: document.getElementById('leaderboard-list'),
        authBlock: document.getElementById('auth-block'),
        welcomeBlock: document.getElementById('welcome-block'),
        welcomeName: document.getElementById('welcome-name'),
        changeNameBtn: document.getElementById('change-name-btn'),
        muteBtn: document.getElementById('mute-btn'),
        musicBtn: document.getElementById('music-btn')
    };

    window.canvas = ui.canvas;
    window.ctx = ui.canvas.getContext('2d');

    ui.muteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        initAudio();
        let muted = toggleMute();
        ui.muteBtn.classList.toggle('muted', muted);
    });

    ui.musicBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        initAudio();
        let musicMuted = toggleMusic();
        ui.musicBtn.classList.toggle('muted', musicMuted);
    });

    let savedName = localStorage.getItem('perfectCut_savedNickname');
    if (savedName) {
        ui.authBlock.style.display = 'none';
        ui.welcomeBlock.style.display = 'block';
        ui.welcomeName.innerText = savedName;
        gameState.currentPlayerName = savedName;
    } else {
        ui.authBlock.style.display = 'block';
        ui.welcomeBlock.style.display = 'none';
    }

    ui.changeNameBtn.addEventListener('click', () => {
        localStorage.removeItem('perfectCut_savedNickname');
        gameState.currentPlayerName = "Гравець";
        ui.nicknameInput.value = "";
        ui.authBlock.style.display = 'block';
        ui.welcomeBlock.style.display = 'none';
        ui.nicknameInput.focus();
    });

    ui.startBtn.addEventListener('click', () => {
        initAudio();
        import('./js/sound.js').then(sound => sound.startMusicLoop());

        let enteredName = gameState.currentPlayerName;

        if (ui.authBlock.style.display !== 'none') {
            enteredName = ui.nicknameInput.value.trim();

            if (enteredName !== "" && !isNaN(enteredName)) {
                ui.nicknameInput.value = "";
                ui.nicknameInput.placeholder = "Цифри заборонені!";
                ui.nicknameInput.focus();
                ui.nicknameInput.style.borderColor = "#e74c3c";
                setTimeout(() => { ui.nicknameInput.style.borderColor = "#2c2c35"; }, 1000);
                return;
            }

            if (enteredName === "") {
                enteredName = "Гравець";
            } else {
                localStorage.setItem('perfectCut_savedNickname', enteredName);
            }
            gameState.currentPlayerName = enteredName;
        }

        document.getElementById('player-name').innerText = gameState.currentPlayerName;
        initPlayerSession();

        ui.menu.style.display = 'none';
        ui.gameUi.style.display = 'flex';
        gameState.gameStarted = true;

        restartGame();

        // Початковий стан: Жодних написів до першого тапу!
        ui.percentDisplay.innerText = "";
        updateUiInterface("", "transparent");
    });

    window.addEventListener('pointerdown', (e) => {
        if (e.target.id === 'start-btn' || e.target.id === 'nickname-input' || e.target.id === 'change-name-btn' || e.target.id === 'mute-btn' || e.target.id === 'music-btn') return;
        e.preventDefault();

        if (gameState.isGameOver) {
            gameState.gameStarted = false;
            ui.gameUi.style.display = 'none';
            ui.menu.style.display = 'flex';

            let currentName = localStorage.getItem('perfectCut_savedNickname');
            if (currentName) {
                ui.authBlock.style.display = 'none';
                ui.welcomeBlock.style.display = 'block';
                ui.welcomeName.innerText = currentName;
            } else {
                ui.nicknameInput.placeholder = "Твій нікнейм...";
            }
            uiRenderLeaderboard(getLeaderboard());
            return;
        }

        handleCut(updateUiInterface);
    });

    uiRenderLeaderboard(getLeaderboard());
    updateLoop();
});

function updateUiInterface(message, color, isNewRecord = false) {
    if (ui.statusMsg) {
        ui.statusMsg.innerText = message;
        ui.statusMsg.style.color = color;
    }

    if (ui.scoreVal) ui.scoreVal.innerText = gameState.score;

    if (ui.livesDisplay) {
        ui.livesDisplay.innerText = "❤️".repeat(gameState.lives) + "🖤".repeat(5 - gameState.lives);
    }

    if (ui.highscoreVal) {
        let savedLeaderboard = getLeaderboard();
        let playerBest = savedLeaderboard.find(item => item.name === gameState.currentPlayerName);
        ui.highscoreVal.innerText = playerBest ? playerBest.score : gameState.highScore;
    }

    if (isNewRecord && ui.highscoreWrap) {
        ui.highscoreWrap.classList.add('new-record');
    } else if (ui.highscoreWrap) {
        ui.highscoreWrap.classList.remove('new-record');
    }
}

function uiRenderLeaderboard(listArray) {
    if (!ui.leaderboardList) return;
    ui.leaderboardList.innerHTML = '';
    if (listArray.length === 0) {
        ui.leaderboardList.innerHTML = '<li style="list-style: none; color: #555; text-align: center; margin-left: -20px;">Немає рекордів</li>';
        return;
    }
    listArray.forEach(item => {
        let li = document.createElement('li');
        li.innerHTML = `<span style="font-weight: bold; color: #fff;">${item.name}</span> — <span style="color: #00ffcc; font-weight: bold;">${item.score}</span>`;
        ui.leaderboardList.appendChild(li);
    });
}