// config.js — ТІЛЬКИ ЧИСТІ ДАНІ ТА НАЛАШТУВАННЯ ГРИ

export const MIN_PERCENT = 42;
export const MAX_PERCENT = 100 - MIN_PERCENT;
export const ACCELERATION_RATE = 0.15;
const shapeLeft = 100;
const shapeRight = 300;
const targetX = 200;
const radius = 100;

export { shapeLeft, shapeRight, targetX, radius };

// Змінні стану, які будуть змінюватися
export let gameState = {
    score: 0,
    highScore: 0,
    lives: 5,
    isGameOver: false,
    isWaitingForNextLevel: false,
    isFrozen: false,
    gameStarted: false,
    currentPlayerName: "Гравець",
    lineX: 100,
    baseSpeed: 3,
    direction: 3,
    currentShapeIndex: 0,
    cutApplied: false,
    isPerfectCut: false,
    fixedCutX: 0,
    cutOffset: 0,
    gravityOffset: 0,
    gravitySpeed: 0,
    cutType: ''
};

export const shapes = ['circle', 'square', 'triangle'];