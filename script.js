const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = 800;
canvas.height = 600;

// Game variables
let spaceship = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    speed: 5,
    dx: 0
};

let keys = {};
let projectiles = [];
let invaders = [];
let machineProjectiles = [];
let score = 0;
let gameOver = false;
let missedInvaders = 0; // Counter for missed invaders

// Load images
const spaceshipImg = new Image();
spaceshipImg.src = 'spaceship.png';

const invaderImg = new Image();
invaderImg.src = 'invader.png';

// Load sound effect
const killSound = new Audio('kill-sound.mp3'); // Placeholder sound file

// Event listeners for keyboard input
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === 'ArrowLeft') spaceship.dx = -spaceship.speed;
    if (e.key === 'ArrowRight') spaceship.dx = spaceship.speed;
    if (e.key === ' ') shootProjectile();
    if (e.key === 'r' || e.key === 'R') shootMachineProjectile();
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    if (!keys['ArrowLeft'] && !keys['ArrowRight']) spaceship.dx = 0;
});

// Shoot projectile from spaceship
function shootProjectile() {
    projectiles.push({
        x: spaceship.x + spaceship.width / 2 - 2.5,
        y: spaceship.y,
        width: 5,
        height: 10,
        speed: 7
    });
}

// Shoot projectile from machine
function shootMachineProjectile() {
    machineProjectiles.push({
        x: spaceship.x + spaceship.width / 2 - 2.5,
        y: spaceship.y - 20,
        width: 5,
        height: 10,
        speed: -7
    });
}

// Spawn a new invader at a random position
function spawnInvader() {
    const invaderWidth = 40;
    const invaderHeight = 40;
    const x = Math.random() * (canvas.width - invaderWidth);

    invaders.push({
        x: x,
        y: 0,
        width: invaderWidth,
        height: invaderHeight,
        speed: 2 // Speed of downward movement
    });
}

// Update game objects
function update() {
    if (gameOver) return;

    // Update spaceship position
    spaceship.x += spaceship.dx;
    if (spaceship.x < 0) spaceship.x = 0;
    if (spaceship.x + spaceship.width > canvas.width) spaceship.x = canvas.width - spaceship.width;

    // Update projectiles
    projectiles.forEach((projectile, index) => {
        projectile.y -= projectile.speed;
        if (projectile.y < 0) projectiles.splice(index, 1);
    });

    // Update machine projectiles
    machineProjectiles.forEach((projectile, index) => {
        projectile.y += projectile.speed;
        if (projectile.y > canvas.height) machineProjectiles.splice(index, 1);

        // Check for collision with invaders
        invaders.forEach((invader, invIndex) => {
            if (
                projectile.x < invader.x + invader.width &&
                projectile.x + projectile.width > invader.x &&
                projectile.y < invader.y + invader.height &&
                projectile.y + projectile.height > invader.y
            ) {
                // Remove invader and projectile
                invaders.splice(invIndex, 1);
                machineProjectiles.splice(index, 1);
                score += 10;

                // Play kill sound
                killSound.currentTime = 0; // Reset sound to start
                killSound.play();
            }
        });
    });

    // Update invaders
    invaders.forEach((invader, index) => {
        invader.y += invader.speed;

        // Check if invader reaches the bottom
        if (invader.y + invader.height >= canvas.height) {
            invaders.splice(index, 1);
            if (missedInvaders >= 10) {
                missedInvaders += 2; // Increment by 2 after 10 invaders have been missed
            } else {
                missedInvaders++; // Increment by 1 for the first 10 invaders
            }

            // Check for game over condition
            if (missedInvaders >= 25) {
                gameOver = true;
            }
        }
    });
}

// Draw game objects
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw spaceship
    ctx.drawImage(spaceshipImg, spaceship.x, spaceship.y, spaceship.width, spaceship.height);

    // Draw projectiles
    projectiles.forEach((projectile) => {
        ctx.fillStyle = 'red';
        ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
    });

    // Draw machine projectiles
    machineProjectiles.forEach((projectile) => {
        ctx.fillStyle = 'blue';
        ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
    });

    // Draw invaders
    invaders.forEach((invader) => {
        ctx.drawImage(invaderImg, invader.x, invader.y, invader.width, invader.height);
    });

    // Draw score
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);

    // Draw missed invaders
    ctx.fillText(`Missed: ${missedInvaders}/25`, 10, 50);

    // Draw game over
    if (gameOver) {
        ctx.fillStyle = 'red';
        ctx.font = '40px Arial';
        ctx.fillText('GAME OVER', canvas.width / 2 - 120, canvas.height / 2);
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    if (!gameOver) requestAnimationFrame(gameLoop);
}

// Start the game
setInterval(spawnInvader, 1000); // Spawn a new invader every second
gameLoop();
// Fullscreen functionality
document.addEventListener('keydown', (e) => {
    if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) {
            canvas.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }
});

// Adjust canvas size when entering or exiting fullscreen
document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    } else {
        canvas.width = 800;
        canvas.height = 600;
    }
});