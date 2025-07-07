"use strict";
const canvas = document.getElementById('canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let score = 0;
let gameOver = false;
let highScore = localStorage.getItem('spaceShooterHighScore') || 0;
let player = { x: 375, y: 530, width: 50, height: 50 };
let bullets = [];
let enemies = [];
let lastEnemySpawn = 0;
const rocketImage = new Image();
rocketImage.src = 'rocket.png';
const shootButton = document.getElementById('shootButton');
rocketImage.onload = () => {
    console.log("Rocket image loaded successfully!");
};
const checkCollision = (obj1, obj2) => {
    return (obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y);
};
const updateScore = (score) => {
    const scoreEl = document.getElementById('score');
    if (scoreEl)
        scoreEl.textContent = score.toString();
};
const startNewGame = () => {
    gameOver = false;
    score = 0;
    enemies = [];
    bullets = [];
    lastEnemySpawn = 0;
    const gameOverEl = document.getElementById('gameOver');
    if (gameOverEl)
        gameOverEl.style.display = 'none';
    updateScore(score);
    gameLoop();
};
const gameLoop = () => {
    if (gameOver)
        return;
    ctx?.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
    if (Date.now() - lastEnemySpawn > 1000) {
        enemies.push({
            x: Math.random() * (canvas?.width || 0 - 30),
            y: -30,
            width: 30,
            height: 30,
            speed: 2 + Math.random() * 2
        });
        lastEnemySpawn = Date.now();
    }
    bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;
        if (bullet.y < -bullet.height) {
            bullets.splice(index, 1);
        }
        else {
            ctx?.drawImage(bullet.image, bullet.x, bullet.y, bullet.width, bullet.height);
        }
    });
    enemies.forEach((enemy, enemyIndex) => {
        enemy.y += enemy.speed;
        bullets.forEach((bullet, bulletIndex) => {
            if (checkCollision(bullet, enemy)) {
                enemies.splice(enemyIndex, 1);
                bullets.splice(bulletIndex, 1);
                score += 100;
                updateScore(score);
            }
        });
        if (checkCollision(player, enemy)) {
            gameOver = true;
            if (score > Number(highScore)) {
                highScore = score;
                localStorage.setItem('spaceShooterHighScore', highScore.toString());
            }
            showGameOver(score, highScore);
        }
        if (canvas && typeof canvas.height === 'number' && enemy.y > canvas.height) {
            enemies.splice(enemyIndex, 1);
        }
        if (ctx)
            ctx.fillStyle = '#ff0000';
        ctx?.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
    ctx?.drawImage(rocketImage, player.x, player.y, player.width, player.height);
    requestAnimationFrame(gameLoop);
};
const shootBullet = () => {
    if (gameOver) {
        startNewGame();
        return;
    }
    bullets.push({
        x: player.x + player.width / 2 - 10,
        y: player.y,
        width: 20,
        height: 40,
        image: rocketImage,
        speed: 7
    });
};
canvas?.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    player.x = e.clientX - rect.left - player.width / 2;
});
canvas?.addEventListener('click', () => {
    shootBullet();
});
shootButton?.addEventListener('click', () => {
    shootBullet();
});
gameLoop();
function showGameOver(score, highScore) {
    const finalScoreEl = document.getElementById('finalScore');
    if (finalScoreEl)
        finalScoreEl.textContent = score.toString();
    const highScoreEl = document.getElementById('highScore');
    if (highScoreEl)
        highScoreEl.textContent = highScore.toString();
    const gameOverEl = document.getElementById('gameOver');
    if (gameOverEl)
        gameOverEl.style.display = 'flex';
}
