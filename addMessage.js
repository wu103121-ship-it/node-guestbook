// 1. 載入套件和設定
const mysql = require('mysql2');
const dbConfig = require('./db-config');

// 2. 建立連線
const connection = mysql.createConnection(dbConfig);

// 3. (重點！) 定義要新增的資料
// 為了教學，我們先寫死 (hardcode) 在程式碼裡
const newUsername = 'NodeJS 程式';
const newContent = '這則留言是從 Node.js 腳本新增的！';

// 4. 定義 SQL 查詢 (使用 ? 作為佔位符)
// 這是為了「防止 SQL 注入 (SQL Injection)」，非常重要！
const sql = "INSERT INTO messages (username, content) VALUES (?, ?)";
// 5. 定義要傳入的值 (陣列)
// 陣列中的順序，會對應到 SQL 語法中 ? 的順序
const values = [newUsername, newContent];
// 6. 執行 SQL 查詢
// connection.query(SQL語法, 傳入的值, 回呼函式)
connection.query(sql, values, (error, results) => {
  // 6a. 錯誤處理
  if (error) {
    console.error('新增資料時發生錯誤:', error);
    return;
  }
  // 6b. 成功！
  // results.insertId 會回傳新資料的 id
  console.log('--- 新增留言成功 ---');
  console.log(`新留言的 ID 是: ${results.insertId}`);
  console.log('--------------------');

  // 7. (教學提示) 讓學生去執行 readMessages.js 或查看 Workbench
  console.log('請執行 node readMessages.js 或檢查 MySQL Workbench 來確認！');
});
// 8. 結束連線
connection.end();
