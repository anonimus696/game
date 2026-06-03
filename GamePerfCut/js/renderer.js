// renderer.js — РЕНДЕРИНГ ГРАФІКИ
import { targetX, radius, shapes, shapeLeft, shapeRight, MIN_PERCENT, MAX_PERCENT, gameState } from './config.js';

function drawShapePath(context, xOffset, yOffset, shape) {
    context.beginPath();
    if (shape === 'circle') {
        context.arc(targetX + xOffset, 200 + yOffset, radius, 0, Math.PI * 2);
    } else if (shape === 'square') {
        context.rect(targetX - radius + xOffset, 200 - radius + yOffset, radius * 2, radius * 2);
    } else if (shape === 'triangle') {
        context.moveTo(targetX + xOffset, 200 - radius + yOffset);
        context.lineTo(targetX + radius + xOffset, 200 + radius + yOffset);
        context.lineTo(targetX - radius + xOffset, 200 + radius + yOffset);
        context.closePath();
    }
}

export function draw() {
    // canvas та ctx беруться автоматично з глобального вікна window
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!gameState.gameStarted) return;

    let currentShape = shapes[gameState.currentShapeIndex];

    if (gameState.cutApplied) {
        gameState.gravitySpeed += 0.5;
        gameState.gravityOffset += gameState.gravitySpeed;
        gameState.cutOffset += 3;

        if (gameState.isPerfectCut) {
            ctx.save(); ctx.beginPath(); ctx.rect(0, 0, gameState.fixedCutX - gameState.cutOffset, 400); ctx.clip();
            drawShapePath(ctx, -gameState.cutOffset, gameState.gravityOffset, currentShape);
            ctx.fillStyle = '#3498db'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#2980b9'; ctx.stroke(); ctx.restore();

            ctx.save(); ctx.beginPath(); ctx.rect(gameState.fixedCutX + gameState.cutOffset, 0, 400, 400); ctx.clip();
            drawShapePath(ctx, gameState.cutOffset, gameState.gravityOffset, currentShape);
            ctx.fillStyle = '#3498db'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#2980b9'; ctx.stroke(); ctx.restore();
        } else {
            if (gameState.cutType === 'left') {
                ctx.save(); ctx.beginPath(); ctx.rect(0, 0, gameState.fixedCutX - gameState.cutOffset, 400); ctx.clip();
                drawShapePath(ctx, -gameState.cutOffset, gameState.gravityOffset, currentShape);
                ctx.fillStyle = '#e74c3c'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#c0392b'; ctx.stroke(); ctx.restore();

                ctx.save(); ctx.beginPath(); ctx.rect(gameState.fixedCutX, 0, 400, 400); ctx.clip();
                drawShapePath(ctx, 0, 0, currentShape);
                ctx.fillStyle = '#3498db'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#2980b9'; ctx.stroke(); ctx.restore();
            } else {
                ctx.save(); ctx.beginPath(); ctx.rect(gameState.fixedCutX + gameState.cutOffset, 0, 400, 400); ctx.clip();
                drawShapePath(ctx, gameState.cutOffset, gameState.gravityOffset, currentShape);
                ctx.fillStyle = '#e74c3c'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#c0392b'; ctx.stroke(); ctx.restore();

                ctx.save(); ctx.beginPath(); ctx.rect(0, 0, gameState.fixedCutX, 400); ctx.clip();
                drawShapePath(ctx, 0, 0, currentShape);
                ctx.fillStyle = '#3498db'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#2980b9'; ctx.stroke(); ctx.restore();
            }
        }
    } else {
        drawShapePath(ctx, 0, 0, currentShape);
        ctx.fillStyle = '#3498db';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#2980b9';
        ctx.stroke();
    }

    if (!gameState.isGameOver && !gameState.isWaitingForNextLevel && !gameState.isFrozen && gameState.gameStarted) {
        gameState.lineX += gameState.direction;
        if (gameState.lineX > shapeRight) { gameState.lineX = shapeRight; gameState.direction = -Math.abs(gameState.direction); }
        else if (gameState.lineX < shapeLeft) { gameState.lineX = shapeLeft; gameState.direction = Math.abs(gameState.direction); }
    }

    // Розрахунок кольору лазера
    let distanceFromCenter = Math.abs(gameState.lineX - targetX);
    let deviation = (distanceFromCenter / radius) * 50;
    let percentLeft = gameState.lineX < targetX ? 50 - deviation : 50 + deviation;
    let inZone = (percentLeft >= MIN_PERCENT && percentLeft <= MAX_PERCENT);

    let lineColor = '#00ffcc';
    if (gameState.isGameOver) { lineColor = '#ff3366'; }
    else if (gameState.isWaitingForNextLevel || gameState.isFrozen) { lineColor = inZone ? '#2ecc71' : '#e74c3c'; }
    else { lineColor = inZone ? '#2ecc71' : '#e74c3c'; }

    let drawLineX = gameState.cutApplied ? gameState.fixedCutX : gameState.lineX;
    ctx.beginPath(); ctx.moveTo(drawLineX, 50); ctx.lineTo(drawLineX, 350); ctx.lineWidth = 4; ctx.strokeStyle = lineColor;
    ctx.shadowBlur = 15; ctx.shadowColor = lineColor; ctx.stroke(); ctx.closePath(); ctx.shadowBlur = 0;
}