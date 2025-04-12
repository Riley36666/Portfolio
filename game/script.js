const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let score = 0;
let gameOver = false;
let highScore = localStorage.getItem('spaceShooterHighScore') || 0;
let player = { x: 375, y: 530, width: 50, height: 50 };
let bullets = [];
let enemies = [];
let lastEnemySpawn = 0;
const rocketImage = new Image();
rocketImage.src = 'rocket.png'; // Make sure the rocket image is in the right path

// Control buttons
const shootButton = document.getElementById('shootButton');

rocketImage.onload = () => {
  console.log("Rocket image loaded successfully!");
};

// Game Loop and Functions
const checkCollision = (obj1, obj2) => {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
};

const updateScore = () => {
  document.getElementById('score').textContent = score;
};

const startNewGame = () => {
  gameOver = false;
  score = 0;
  enemies = [];
  bullets = [];
  lastEnemySpawn = 0;
  document.getElementById('gameOver').style.display = 'none';
  updateScore();
  gameLoop();
};

const gameLoop = () => {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Spawn enemies
  if (Date.now() - lastEnemySpawn > 1000) {
    enemies.push({
      x: Math.random() * (canvas.width - 30),
      y: -30,
      width: 30,
      height: 30,
      speed: 2 + Math.random() * 2
    });
    lastEnemySpawn = Date.now();
  }

  // Update and draw bullets (rockets)
  bullets.forEach((bullet, index) => {
    bullet.y -= bullet.speed; // Move the rocket upwards

    if (bullet.y < -bullet.height) {
      bullets.splice(index, 1); // Remove the rocket if it's off-screen
    } else {
      // Draw the rocket image for the bullet
      ctx.drawImage(bullet.image, bullet.x, bullet.y, bullet.width, bullet.height);
    }
  });

  // Update and draw enemies
  enemies.forEach((enemy, enemyIndex) => {
    enemy.y += enemy.speed;

    // Check for collision with bullets
    bullets.forEach((bullet, bulletIndex) => {
      if (checkCollision(bullet, enemy)) {
        enemies.splice(enemyIndex, 1);
        bullets.splice(bulletIndex, 1);
        score += 100;
        updateScore();
      }
    });

    // Check for collision with player
    if (checkCollision(player, enemy)) {
      gameOver = true;
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('spaceShooterHighScore', highScore);
      }
      document.getElementById('finalScore').textContent = score;
      document.getElementById('highScore').textContent = highScore;
      document.getElementById('gameOver').style.display = 'flex';
    }

    // Remove off-screen enemies
    if (enemy.y > canvas.height) {
      enemies.splice(enemyIndex, 1);
    }

    // Draw enemy
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  });

  // Draw player using the rocket image
  ctx.drawImage(rocketImage, player.x, player.y, player.width, player.height);

  requestAnimationFrame(gameLoop);
};

// Shoot rocket function (triggered by the shoot button)
const shootBullet = () => {
  if (gameOver) {
    startNewGame(); // Restart game if it's over
    return;
  }

  // Push the rocket as a bullet, using the rocket image
  bullets.push({
    x: player.x + player.width / 2 - 10, // Center the rocket horizontally
    y: player.y,  // Start the rocket at the player's current position
    width: 20,     // Set the width of the rocket
    height: 40,    // Set the height of the rocket
    image: rocketImage, // Use the rocket image
    speed: 7        // Set the speed of the rocket
  });
};

// Mouse move handler for desktop (or touch move on mobile)
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  player.x = e.clientX - rect.left - player.width / 2;
});

// Add event listener for shooting (using canvas click)
canvas.addEventListener('click', () => {
  shootBullet(); // Call shootBullet when clicked on canvas
});

// Mobile Shoot Button
shootButton.addEventListener('click', () => {
  shootBullet(); // Trigger shoot bullet on mobile button click
});

// Start the game
gameLoop();
