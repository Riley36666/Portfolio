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
rocketImage.src = 'rocket.png';


const shootButton = document.getElementById('shootButton');

rocketImage.onload = () => {
  console.log("Rocket image loaded successfully!");
};


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


  bullets.forEach((bullet, index) => {
    bullet.y -= bullet.speed;

    if (bullet.y < -bullet.height) {
      bullets.splice(index, 1); 
    } else {
 
      ctx.drawImage(bullet.image, bullet.x, bullet.y, bullet.width, bullet.height);
    }
  });


  enemies.forEach((enemy, enemyIndex) => {
    enemy.y += enemy.speed;

  
    bullets.forEach((bullet, bulletIndex) => {
      if (checkCollision(bullet, enemy)) {
        enemies.splice(enemyIndex, 1);
        bullets.splice(bulletIndex, 1);
        score += 100;
        updateScore();
      }
    });


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


    if (enemy.y > canvas.height) {
      enemies.splice(enemyIndex, 1);
    }


    ctx.fillStyle = '#ff0000';
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  });


  ctx.drawImage(rocketImage, player.x, player.y, player.width, player.height);

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


canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  player.x = e.clientX - rect.left - player.width / 2;
});


canvas.addEventListener('click', () => {
  shootBullet(); 
});


shootButton.addEventListener('click', () => {
  shootBullet(); 
});


gameLoop();
