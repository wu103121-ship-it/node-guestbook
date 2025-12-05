const guessSubmit = document.querySelector(".guessSubmit");
const guessField = document.querySelector(".guessField");
const result = document.querySelector(".result");
const count = document.querySelector(".count");
const guesses = document.querySelector(".guesses");
const restartBth = document.querySelector(".restartBth");


let countNum =0;   //廣域變數
let randomNumber = Math.random();
console.log("觀察隨機的數字：", randomNumber);
randomNumber = Math.floor(randomNumber *100) + 1; //1~100
console.log("觀察隨機的整數：", randomNumber);

function checkGuess() {
    countNum++;
    count.textContent = "猜測次數："+countNum;
    const userGuess =  Number(guessField.value);  //取得欄位值，並轉為數字
    guesses.textContent += userGuess +" ";

if  ( userGuess  === randomNumber ) {
    result.textContent = "猜測結果：Congratulations!" ;
}
else if ( userGuess < randomNumber ) {
    result.textContent = "猜測結果：數字太小!" ;
}
else if (userGuess  > randomNumber ) {
    result.textContent = "猜測結果：數字太大!";
}
//guessField.focus();       //游標焦點預設在輸入欄位裡
if (countNum > 10){
    result.textContent += "遊戲結束";
    result.style.backgroundColor="red";
    alert("遊戲結束");
    setGameOver();

}
}
function setGameOver() {
        guessField.disabled = true; //停止輸入功能
        guessSubmit.disabled = true;    //停止按鈕功能

}
function initGame() {
    // 初始化遊戲
    
}

 