// game.js — ОБРОБКА МАТЕМАТИКИ ТА РЕЗУЛЬТАТІВ РОЗРІЗУ
import { targetX, radius, MIN_PERCENT, MAX_PERCENT, shapeLeft, ACCELERATION_RATE, shapes, gameState } from './config.js';
import { getLeaderboard, saveRecord } from './leaderboard.js';
import { draw } from './renderer.js';
import { playPerfectCutSound, playWrongCutSound, updateLaserSound, playGameOverMusic } from './sound.js';

export function initPlayerSession() {
    let leaderboard = getLeaderboard();
    let playerBest = leaderboard.find(item => item.name === gameState.currentPlayerName);
    gameState.highScore = playerBest ? playerBest.score : 0;
}

export function calculatePercentages(x) {
    let distanceFromCenter = Math.abs(x - targetX);
    let deviation = (distanceFromCenter / radius) * 50;
    let percentLeft = x < targetX ? 50 - deviation : 50 + deviation;

    if (percentLeft < 0) percentLeft = 0;
    if (percentLeft > 100) percentLeft = 100;

    return {
        left: percentLeft,
        right: 100 - percentLeft,
        inZone: (percentLeft >= MIN_PERCENT && percentLeft <= MAX_PERCENT)
    };
}

export function updateLoop() {
    draw();
    updateLaserSound(gameState.lineX);
    requestAnimationFrame(updateLoop);
}

function startNextLevel(onUiUpdate) {
    gameState.isFrozen = false;
    gameState.isWaitingForNextLevel = false;
    gameState.cutApplied = false;
    gameState.cutOffset = 0; gameState.gravityOffset = 0; gameState.gravitySpeed = 0;

    gameState.currentShapeIndex = Math.floor(gameState.score / 3) % shapes.length;
    gameState.lineX = shapeLeft;
    gameState.direction = gameState.baseSpeed + (gameState.score * ACCELERATION_RATE);

    // ПОВНЕ ОЧИЩЕННЯ: Видаляємо всі тексти на час руху лазера
    onUiUpdate("", "transparent");
    let percentEl = document.getElementById('percent-display');
    if (percentEl) percentEl.innerText = "";
}

export function restartGame() {
    gameState.score = 0; gameState.lives = 5; gameState.currentShapeIndex = 0;
    gameState.isGameOver = false; gameState.isWaitingForNextLevel = false; gameState.isFrozen = false; gameState.cutApplied = false;
    gameState.cutOffset = 0; gameState.gravityOffset = 0; gameState.gravitySpeed = 0;
    gameState.lineX = shapeLeft; gameState.direction = gameState.baseSpeed;
}

export function handleCut(onUiUpdate) {
    if (!gameState.gameStarted || gameState.isGameOver || gameState.isWaitingForNextLevel || gameState.isFrozen) return;

    gameState.isFrozen = true;
    gameState.fixedCutX = gameState.lineX;
    gameState.cutApplied = true;

    let result = calculatePercentages(gameState.lineX);
    let finalPercent = result.left;
    let oppositePercent = result.right;

    // Виводимо відсотки тільки ПІСЛЯ ТАПУ в красиву нижню зону
    let percentEl = document.getElementById('percent-display');
    if (percentEl) {
        percentEl.innerText = `${finalPercent.toFixed(1)} | ${oppositePercent.toFixed(1)}`;
    }

    let diff = Math.abs(finalPercent - 50);

    if (result.inZone) {
        gameState.isPerfectCut = true;
        gameState.score++;
        let isNewRecord = false;

        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            isNewRecord = true;
        }

        playPerfectCutSound();

        let word = "ЧУДОВО!";
        let wordColor = "#2ecc71"; // Зелений

        if (diff < 1.0) {
            word = "ІДЕАЛЬНО!!!";
            wordColor = "#00ffcc"; // Неоновий бірюзовий
        } else if (diff < 3.0) {
            word = "ПРЕКРАСНО!";
            wordColor = "#a8ff60"; // Салатовий
        }

        // Відображаємо оцінку у верхній виділеній зоні
        onUiUpdate(word, wordColor, isNewRecord);

        gameState.isWaitingForNextLevel = true;
        setTimeout(() => startNextLevel(onUiUpdate), 1200);
    } else {
        gameState.isPerfectCut = false;
        gameState.lives--;

        if (finalPercent < oppositePercent) {
            gameState.cutType = 'left';
        } else {
            gameState.cutType = 'right';
        }

        if (gameState.lives <= 0) {
            playGameOverMusic();

            setTimeout(() => {
                gameState.isGameOver = true;
                saveRecord(gameState.currentPlayerName, gameState.score);
                onUiUpdate("ЖИТТЯ ЗАКІНЧИЛИСЬ!\nТАПНИ ДЛЯ МЕНЮ", "#e74c3c");
            }, 1200);
        } else {
            playWrongCutSound();

            // При КРИВОМУ розрізі також виводимо статус нагору, а відсотки знизу вже оновилися!
            onUiUpdate("КРИВО!", "#e74c3c");

            gameState.isWaitingForNextLevel = true;
            setTimeout(() => startNextLevel(onUiUpdate), 1400);
        }
    }
}