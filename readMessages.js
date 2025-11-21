// 1. 載入 mysql2 套件
const mysql = require('mysql2');
// 2. 載入我們剛剛寫的連線設定
const dbConfig = require('./db-config');

// 3. 建立連線
// mysql.createConnection() 會建立一個連線物件
const connection = mysql.createConnection(dbConfig);

// 4. 測試定義要執行的 SQL 查詢(可刪)
// 依照時間倒序 (DESC)，讓最新的留言在最上面
const sql = "SELECT * FROM messages ORDER BY created_at DESC";
// 5. 測試執行 SQL 查詢(可刪)
// connection.query(SQL語法, 回呼函式)
// 回呼函式 (Callback Function) 會在查詢完成後被觸發
connection.query(sql, (error, results) => {
  // 5a. 錯誤處理
  if (error) {
    console.error('執行查詢時發生錯誤:', error);
    return;
  }
  // 5b. 成功！印出查詢結果
  console.log('--- 留言板所有內容 ---');
  // 'results' 會是一個陣列，包含所有資料
  results.forEach((message) => {
    console.log(`[${message.created_at.toLocaleString()}] ${message.username} 說: ${message.content}`);
  });
  console.log('----------------------');
  console.log(`總共 ${results.length} 則留言。`);
});
// 6. 結束連線
// 查詢是「非同步」的，所以要確保查詢完成後才關閉
// (為簡化教學，我們先放在最後，但進階作法會放在 callback 裡)
connection.end((err) => {
  if (err) {
    console.error('關閉連線時發生錯誤:', err);
  }
  // console.log('MySQL 連線已關閉。');
});
