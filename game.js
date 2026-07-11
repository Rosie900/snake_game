// 游戏配置
const CONFIG = {
    CANVAS_WIDTH: 400,
    CANVAS_HEIGHT: 400,
    GRID_SIZE: 20,
    INITIAL_SPEED: 150,
    SPEED_INCREMENT: 5,
    MIN_SPEED: 50,
    POINTS_PER_FOOD: 10,
};

// 游戏状态
let gameState = {
    snake: [],
    food: {},
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    score: 0,
    highScore: 0,
    speed: CONFIG.INITIAL_SPEED,
    isPaused: false,
    isGameOver: false,
    gameLoop: null,
};

// DOM元素
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const welcomeScreen = document.getElementById('welcome-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreElement = document.getElementById('final-score-value');
const newRecordElement = document.getElementById('new-record');

// 按钮
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const playAgainBtn = document.getElementById('play-again-btn');

// 移动端控制按钮
const upBtn = document.getElementById('up-btn');
const downBtn = document.getElementById('down-btn');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');

// 音效
const eatSound = document.getElementById('eat-sound');
const gameOverSound = document.getElementById('game-over-sound');

// 初始化画布
function initCanvas() {
    canvas.width = CONFIG.CANVAS_WIDTH;
    canvas.height = CONFIG.CANVAS_HEIGHT;
}

// 初始化游戏
function initGame() {
    // 从localStorage读取最高分
    const savedHighScore = localStorage.getItem('snakeHighScore');
    gameState.highScore = savedHighScore ? parseInt(savedHighScore) : 0;
    highScoreElement.textContent = gameState.highScore;

    // 初始化蛇的位置
    gameState.snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
    ];

    // 初始化方向
    gameState.direction = 'RIGHT';
    gameState.nextDirection = 'RIGHT';

    // 初始化分数和速度
    gameState.score = 0;
    gameState.speed = CONFIG.INITIAL_SPEED;

    // 生成食物
    spawnFood();

    // 更新分数显示
    scoreElement.textContent = gameState.score;

    // 重置游戏状态
    gameState.isPaused = false;
    gameState.isGameOver = false;

    // 绘制初始画面
    draw();
}

// 生成食物
function spawnFood() {
    let food;
    do {
        food = {
            x: Math.floor(Math.random() * (CONFIG.CANVAS_WIDTH / CONFIG.GRID_SIZE)),
            y: Math.floor(Math.random() * (CONFIG.CANVAS_HEIGHT / CONFIG.GRID_SIZE)),
        };
    } while (gameState.snake.some(segment => segment.x === food.x && segment.y === food.y));

    gameState.food = food;
}

// 绘制游戏画面
function draw() {
    // 清空画布
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    // 绘制网格
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= CONFIG.CANVAS_WIDTH; x += CONFIG.GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CONFIG.CANVAS_HEIGHT);
        ctx.stroke();
    }
    for (let y = 0; y <= CONFIG.CANVAS_HEIGHT; y += CONFIG.GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CONFIG.CANVAS_WIDTH, y);
        ctx.stroke();
    }

    // 绘制食物
    drawFood();

    // 绘制蛇
    drawSnake();

    // 如果暂停，显示暂停提示
    if (gameState.isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('暂停', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2);
    }
}

// 绘制食物
function drawFood() {
    const { x, y } = gameState.food;
    const centerX = x * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE / 2;
    const centerY = y * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE / 2;
    const radius = CONFIG.GRID_SIZE / 2 - 2;

    // 渐变效果
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, '#fbbf24');
    gradient.addColorStop(1, '#f59e0b');

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 添加闪烁效果
    ctx.beginPath();
    ctx.arc(centerX - 4, centerY - 4, radius / 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fill();
}

// 绘制蛇
function drawSnake() {
    gameState.snake.forEach((segment, index) => {
        const x = segment.x * CONFIG.GRID_SIZE;
        const y = segment.y * CONFIG.GRID_SIZE;

        // 根据位置设置颜色
        const ratio = index / gameState.snake.length;
        const greenShade = Math.floor(74 + ratio * (222 - 74));
        const color = `rgb(${greenShade}, 222, ${128 + ratio * 50})`;

        // 绘制蛇身
        ctx.fillStyle = color;
        ctx.fillRect(x + 1, y + 1, CONFIG.GRID_SIZE - 2, CONFIG.GRID_SIZE - 2);

        // 绘制边框
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 1, y + 1, CONFIG.GRID_SIZE - 2, CONFIG.GRID_SIZE - 2);

        // 如果是蛇头，添加眼睛
        if (index === 0) {
            drawEyes(x, y);
        }
    });
}

// 绘制蛇眼
function drawEyes(x, y) {
    const eyeSize = 3;
    const eyeOffset = 4;

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x + eyeOffset, y + eyeOffset, eyeSize, 0, Math.PI * 2);
    ctx.arc(x + CONFIG.GRID_SIZE - eyeOffset, y + eyeOffset, eyeSize, 0, Math.PI * 2);
    ctx.fill();

    // 瞳孔
    ctx.fillStyle = '#000';
    const pupilOffset = getPupilOffset();
    ctx.beginPath();
    ctx.arc(x + eyeOffset + pupilOffset.x, y + eyeOffset + pupilOffset.y, 1.5, 0, Math.PI * 2);
    ctx.arc(x + CONFIG.GRID_SIZE - eyeOffset + pupilOffset.x, y + eyeOffset + pupilOffset.y, 1.5, 0, Math.PI * 2);
    ctx.fill();
}

// 根据方向获取瞳孔偏移
function getPupilOffset() {
    switch (gameState.direction) {
        case 'UP': return { x: 0, y: -1 };
        case 'DOWN': return { x: 0, y: 1 };
        case 'LEFT': return { x: -1, y: 0 };
        case 'RIGHT': return { x: 1, y: 0 };
        default: return { x: 1, y: 0 };
    }
}

// 移动蛇
function moveSnake() {
    if (gameState.isPaused || gameState.isGameOver) return;

    // 更新方向
    gameState.direction = gameState.nextDirection;

    // 获取蛇头位置
    const head = gameState.snake[0];
    let newHead;

    // 根据方向计算新蛇头位置
    switch (gameState.direction) {
        case 'UP':
            newHead = { x: head.x, y: head.y - 1 };
            break;
        case 'DOWN':
            newHead = { x: head.x, y: head.y + 1 };
            break;
        case 'LEFT':
            newHead = { x: head.x - 1, y: head.y };
            break;
        case 'RIGHT':
            newHead = { x: head.x + 1, y: head.y };
            break;
    }

    // 碰撞检测
    if (checkCollision(newHead)) {
        gameOver();
        return;
    }

    // 将新蛇头添加到数组开头
    gameState.snake.unshift(newHead);

    // 检查是否吃到食物
    if (newHead.x === gameState.food.x && newHead.y === gameState.food.y) {
        eatFood();
    } else {
        // 移除蛇尾
        gameState.snake.pop();
    }

    // 重新绘制
    draw();
}

// 碰撞检测
function checkCollision(head) {
    // 边界碰撞
    if (
        head.x < 0 ||
        head.x >= CONFIG.CANVAS_WIDTH / CONFIG.GRID_SIZE ||
        head.y < 0 ||
        head.y >= CONFIG.CANVAS_HEIGHT / CONFIG.GRID_SIZE
    ) {
        return true;
    }

    // 自身碰撞（排除蛇头）
    return gameState.snake.some((segment, index) => index !== 0 && segment.x === head.x && segment.y === head.y);
}

// 吃到食物
function eatFood() {
    // 增加分数
    gameState.score += CONFIG.POINTS_PER_FOOD;
    scoreElement.textContent = gameState.score;

    // 播放音效
    playSound(eatSound);

    // 增加速度（难度递增）
    if (gameState.speed > CONFIG.MIN_SPEED) {
        gameState.speed -= CONFIG.SPEED_INCREMENT;
        restartGameLoop();
    }

    // 生成新食物
    spawnFood();
}

// 游戏结束
function gameOver() {
    gameState.isGameOver = true;
    clearInterval(gameState.gameLoop);

    // 播放音效
    playSound(gameOverSound);

    // 更新最高分
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('snakeHighScore', gameState.highScore.toString());
        highScoreElement.textContent = gameState.highScore;
        newRecordElement.classList.remove('hidden');
    } else {
        newRecordElement.classList.add('hidden');
    }

    // 显示游戏结束界面
    finalScoreElement.textContent = gameState.score;
    gameScreen.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
}

// 播放音效
function playSound(audioElement) {
    try {
        audioElement.currentTime = 0;
        audioElement.play().catch(() => {});
    } catch (e) {
        // 忽略音效播放错误
    }
}

// 开始游戏循环
function startGameLoop() {
    if (gameState.gameLoop) return;
    gameState.gameLoop = setInterval(moveSnake, gameState.speed);
}

// 停止游戏循环
function stopGameLoop() {
    if (gameState.gameLoop) {
        clearInterval(gameState.gameLoop);
        gameState.gameLoop = null;
    }
}

// 重启游戏循环（用于速度变化）
function restartGameLoop() {
    stopGameLoop();
    startGameLoop();
}

// 键盘控制
function handleKeyDown(event) {
    const key = event.key;

    // 方向键控制
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's', 'a', 'd'].includes(key)) {
        event.preventDefault();
        
        const keyMap = {
            'ArrowUp': 'UP',
            'ArrowDown': 'DOWN',
            'ArrowLeft': 'LEFT',
            'ArrowRight': 'RIGHT',
            'w': 'UP',
            'W': 'UP',
            's': 'DOWN',
            'S': 'DOWN',
            'a': 'LEFT',
            'A': 'LEFT',
            'd': 'RIGHT',
            'D': 'RIGHT',
        };

        const newDirection = keyMap[key];
        
        // 防止180度转向
        const opposites = {
            'UP': 'DOWN',
            'DOWN': 'UP',
            'LEFT': 'RIGHT',
            'RIGHT': 'LEFT',
        };

        if (opposites[gameState.direction] !== newDirection) {
            gameState.nextDirection = newDirection;
        }
    }

    // 空格键暂停/继续
    if (key === ' ' && !gameState.isGameOver) {
        event.preventDefault();
        togglePause();
    }
}

// 移动端按钮控制
function handleMobileControl(direction) {
    if (gameState.isGameOver) return;

    const opposites = {
        'UP': 'DOWN',
        'DOWN': 'UP',
        'LEFT': 'RIGHT',
        'RIGHT': 'LEFT',
    };

    if (opposites[gameState.direction] !== direction) {
        gameState.nextDirection = direction;
    }
}

// 暂停/继续游戏
function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    
    if (gameState.isPaused) {
        stopGameLoop();
        pauseBtn.textContent = '继续';
    } else {
        startGameLoop();
        pauseBtn.textContent = '暂停';
    }
    
    draw();
}

// 开始游戏
function startGame() {
    welcomeScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    initGame();
    startGameLoop();
}

// 重新开始游戏
function restartGame() {
    stopGameLoop();
    initGame();
    startGameLoop();
}

// 再玩一次
function playAgain() {
    gameOverScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    restartGame();
}

// 事件监听
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', restartGame);
playAgainBtn.addEventListener('click', playAgain);

// 键盘事件
document.addEventListener('keydown', handleKeyDown);

// 移动端控制事件
upBtn.addEventListener('click', () => handleMobileControl('UP'));
downBtn.addEventListener('click', () => handleMobileControl('DOWN'));
leftBtn.addEventListener('click', () => handleMobileControl('LEFT'));
rightBtn.addEventListener('click', () => handleMobileControl('RIGHT'));

// 防止移动端触摸滚动
document.addEventListener('touchmove', (e) => {
    if (gameScreen.classList.contains('hidden')) return;
    e.preventDefault();
}, { passive: false });

// 初始化
initCanvas();

// 如果是移动端，显示触摸控制提示
if ('ontouchstart' in window) {
    const touchHint = document.createElement('p');
    touchHint.textContent = '💡 点击下方按钮控制方向';
    touchHint.style.marginTop = '15px';
    touchHint.style.color = '#aaa';
    gameScreen.appendChild(touchHint);
}