const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');

// Установка размера холста
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Игровые переменные
let score = 0;
let lives = 3;
let gameRunning = false;
let animationId;
let gameSpeed = 1;

// Калитка (карельский пирог)
const kalitka = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    width: 100,
    height: 25,
    speed: 8,
    draw() {
        // Основание (ржаное тесто)
        ctx.fillStyle = '#d2b48c';
        ctx.beginPath();
        ctx.roundRect(this.x - this.width/2, this.y - this.height, this.width, this.height, [5, 5, 15, 15]);
        ctx.fill();
        
        // Защипы по краям
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const pinchCount = 5;
        for (let i = 0; i <= pinchCount; i++) {
            const x = this.x - this.width/2 + (this.width/pinchCount) * i;
            ctx.moveTo(x, this.y - this.height);
            ctx.lineTo(x, this.y - this.height + 8);
        }
        ctx.stroke();
        
        // Начинка (картофельно-крупяная)
        ctx.fillStyle = '#f5deb3';
        ctx.beginPath();
        ctx.roundRect(
            this.x - this.width/2 + 3, 
            this.y - this.height + 5, 
            this.width - 6, 
            this.height - 8, 
            [3, 3, 10, 10]
        );
        ctx.fill();
        
        // Масляные пятна
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(
                this.x - this.width/4 + (this.width/4) * i,
                this.y - this.height/2,
                2 + Math.random() * 3,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    },
    move(direction) {
        if (direction === 'left' && this.x - this.width/2 > 10) {
            this.x -= this.speed;
        }
        if (direction === 'right' && this.x + this.width/2 < canvas.width - 10) {
            this.x += this.speed;
        }
    }
};

// Ягоды
let berries = [];
const berryTypes = [
    {color: '#ff0000', name: 'брусника'},
    {color: '#4b0082', name: 'черника'},
    {color: '#8b0000', name: 'клюква'}
];

function createBerry() {
    // Уменьшенная частота появления ягод (0.003 вместо 0.01)
    if (Math.random() > 0.003 * gameSpeed) return;
    
    const type = Math.floor(Math.random() * berryTypes.length);
    const x = Math.random() * (canvas.width - 30) + 15;
    // Уменьшенная скорость падения
    const speed = Math.random() * 0.8 + 0.3 * gameSpeed;
    
    berries.push({
        x: x,
        y: -40,
        radius: 6 + Math.random() * 4,
        speed: speed,
        color: berryTypes[type].color,
        type: type,
        rotation: Math.random() * Math.PI * 2
    });
}

function drawLives() {
    livesElement.innerHTML = '';
    for (let i = 0; i < lives; i++) {
        const lifeIcon = document.createElement('div');
        lifeIcon.style.display = 'inline-block';
        lifeIcon.style.width = '20px';
        lifeIcon.style.height = '12px';
        lifeIcon.style.margin = '0 3px';
        lifeIcon.style.backgroundColor = '#d2b48c';
        lifeIcon.style.borderRadius = '2px 2px 8px 8px';
        lifeIcon.style.position = 'relative';
        
        const filling = document.createElement('div');
        filling.style.position = 'absolute';
        filling.style.width = '16px';
        filling.style.height = '4px';
        filling.style.left = '2px';
        filling.style.bottom = '3px';
        filling.style.backgroundColor = '#f5deb3';
        filling.style.borderRadius = '2px';
        
        lifeIcon.appendChild(filling);
        livesElement.appendChild(lifeIcon);
    }
}

function drawBerries() {
    berries.forEach(berry => {
        ctx.save();
        ctx.translate(berry.x, berry.y);
        ctx.rotate(berry.rotation);
        
        ctx.fillStyle = berry.color;
        ctx.beginPath();
        ctx.arc(0, 0, berry.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < 3; i++) {
            const angle = Math.PI * 2 * i / 3;
            ctx.beginPath();
            ctx.arc(
                Math.cos(angle) * berry.radius * 0.5,
                Math.sin(angle) * berry.radius * 0.5,
                1 + Math.random(),
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        
        ctx.fillStyle = '#2e8b57';
        ctx.beginPath();
        ctx.ellipse(
            -berry.radius * 0.7,
            -berry.radius * 0.5,
            berry.radius * 0.5,
            berry.radius * 0.2,
            Math.PI/4,
            0,
            Math.PI
        );
        ctx.fill();
        
        ctx.restore();
    });
}

function updateBerries() {
    for (let i = berries.length - 1; i >= 0; i--) {
        berries[i].y += berries[i].speed;
        berries[i].rotation += 0.03;
        
        if (berries[i].y + berries[i].radius > kalitka.y - kalitka.height && 
            berries[i].y - berries[i].radius < kalitka.y &&
            berries[i].x > kalitka.x - kalitka.width/2 && 
            berries[i].x < kalitka.x + kalitka.width/2) {
            berries.splice(i, 1);
            score++;
            scoreElement.textContent = `Ягоды: ${score}`;
            
            // Увеличиваем сложность каждые 10 ягод (было 7)
            if (score % 10 === 0) {
                gameSpeed += 0.1;
            }
            continue;
        }
        
        if (berries[i].y > canvas.height + berries[i].radius) {
            berries.splice(i, 1);
            lives--;
            drawLives();
            
            if (lives <= 0) {
                gameOver();
            }
        }
    }
}

function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    startScreen.style.display = 'flex';
    startScreen.innerHTML = `
        <h1>Игра окончена!</h1>
        <p>Вы собрали ${score} ягод для калиток</p>
        <button id="restartButton">Играть снова</button>
    `;
    document.getElementById('restartButton').addEventListener('click', startGame);
}

function drawBackground() {
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#87ceeb');
    skyGradient.addColorStop(1, '#e6f2ff');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#87a8ce';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 30);
    ctx.lineTo(canvas.width, canvas.height - 30);
    ctx.stroke();
}

// Управление
const keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

function handleInput() {
    if (keys['ArrowLeft'] || keys['a']) kalitka.move('left');
    if (keys['ArrowRight'] || keys['d']) kalitka.move('right');
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();
    handleInput();
    createBerry();
    drawBerries();
    updateBerries();
    kalitka.draw();
    
    if (gameRunning) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

function startGame() {
    startScreen.style.display = 'none';
    gameRunning = true;
    score = 0;
    lives = 3;
    gameSpeed = 1;
    scoreElement.textContent = `Ягоды: ${score}`;
    berries = [];
    drawLives();
    gameLoop();
}

startButton.addEventListener('click', startGame);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    kalitka.y = canvas.height - 30;
});