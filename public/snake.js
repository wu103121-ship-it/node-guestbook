const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// 一次性定義方格與地圖大小
const BLOCK_SIZE = 20;                        // 放大畫素，20點為一格
const MAP_SIZE = Math.floor(canvas.width / BLOCK_SIZE); // 依 canvas 寬度計算格數

let gameInterval; // 先宣告 interval 變數

//建立蛇蛇、蘋果物件    
let snake = {
    //身體位置    
    body: [ { x: Math.floor(MAP_SIZE / 2), y: Math.floor(MAP_SIZE / 2) } ],  
    //身體長度    
    size: 5, 
    //行進方向 
    direction: { x: 0, y: -1 }, 
    //畫蛇
    drawSnake: function () {
        this.moveSnake();
        ctx.fillStyle = 'lime';
        for (let i = 0; i < this.body.length; i++) {      
            ctx.fillRect(
                this.body[i].x * BLOCK_SIZE,
                this.body[i].y * BLOCK_SIZE,
                BLOCK_SIZE,
                BLOCK_SIZE
            );
        }
    },
    //移動蛇
    moveSnake: function () {
        const newBlock = {
            x: this.body[0].x + this.direction.x,
            y: this.body[0].y + this.direction.y
        };
        this.body.unshift(newBlock);
        while (this.body.length > this.size) {
            this.body.pop();
        }
    }
};

let apple = { 
    //蘋果位置
    x: 5,
    y: 5,
    //畫蘋果
    drawApple: function () {
        ctx.fillStyle = 'red';
        ctx.fillRect(
            this.x * BLOCK_SIZE,
            this.y * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
        );
    },
    //放蘋果
    putApple: function () {
        this.x = Math.floor(Math.random() * MAP_SIZE);
        this.y = Math.floor(Math.random() * MAP_SIZE);
    }
};

// 檢查蛇是否吃到蘋果，若吃到則重新放蘋果
function checkAppleCollision() {
    for (let i = 0; i < snake.body.length; i++) {
        if (snake.body[i].x === apple.x && snake.body[i].y === apple.y) {
            apple.putApple();
            return true;
        }
    }
    return false;
}

function gameStart() {
    gameInterval = setInterval(drawGame, 100);
}
/////
apple.putApple(); // 隨機放置一次蘋果（避免一開始就蓋在蛇上）
gameStart(); //執行開始遊戲

function keyDown(event) {
    //up
    if (event.keyCode == 38 || event.keyCode == 87){
        if (snake.direction.y == 1) return;
        snake.direction.y = -1;
        snake.direction.x = 0;
    }
    //down
    else if (event.keyCode == 40 || event.keyCode == 83) {
        if (snake.direction.y == -1) return;
        snake.direction.y = 1;
        snake.direction.x = 0;
    }
    //left
    else if (event.keyCode == 37 || event.keyCode == 65) {
        if (snake.direction.x == 1) return;
        snake.direction.x = -1;
        snake.direction.y = 0;
    }
    //right
    else if (event.keyCode == 39 || event.keyCode == 68) {
        if (snake.direction.x == -1) return;
        snake.direction.x = 1;
        snake.direction.y = 0;
    }
}
/////
document.addEventListener("keydown", keyDown);

let score = 0;      // 紀錄分數
function drawGame() {
    drawMap();
    apple.drawApple();
    snake.drawSnake();
    eatApple(); 
    drawScore();
    checkDeath();    
}
function drawMap() {
    ctx.fillStyle = 'black' ;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
function eatApple() {
    if (snake.body[0].x === apple.x && snake.body[0].y === apple.y) {
        snake.size += 1;
        score++;
        apple.putApple();
    }
}
function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = "10px Verdana";
    ctx.fillText("Score " + score, canvas.width - 50, 10);    
}
function checkDeath() {
    // hit walls
    if( (snake.body[0].x < 0) ||
        (snake.body[0].x >= MAP_SIZE)||
        (snake.body[0].y < 0) ||
        (snake.body[0].y >= MAP_SIZE)
    ){
        clearInterval(gameInterval);
    }
    // hit body
    for (var i=1; i<snake.body.length; i++) {
        if (snake.body[0].x === snake.body[i].x &&
            snake.body[0].y === snake.body[i].y) {
                clearInterval(gameInterval);
            }  
    }
}