// --- 1. 載入套件 ---
const express = require('express');
const mysql = require('mysql2');
const path = require('path'); // (新) 載入 path 模組
const dbConfig = require('./db-config');
// --- 2. 建立 Express 應用程式和連線 ---
const app = express();
const port = 3000;
const connection = mysql.createConnection(dbConfig);
// const connection = mysql.createPool(dbConfig); // 建議改用 createPool 比較穩定

// --- 3. 設定 Express 中介軟體 (Middleware) ---
// (A) 為了能解析 <form> POST 過來的資料
app.use(express.urlencoded({ extended: true }));
// (B) (新！) 告訴 Express 去 "public" 資料夾中提供「靜態檔案」
// 這是讓瀏覽器能存取 index.html 的關鍵
// 當使用者造訪 http://localhost:3000/
// Express 會自動去 public 資料夾裡找 index.html 並回傳
app.use(express.static(path.join(__dirname, 'public')));
// --- 4. 建立 API 路由 (Routes) ---
// 路由 A：GET /api/messages (新 API)
// 目標：從資料庫讀取資料，並回傳「JSON」格式
app.get('/api/messages', (req, res) => {
  const sql = "SELECT * FROM messages ORDER BY created_at DESC"; 
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('讀取資料時發生錯誤:', err);
      // 回傳 500 錯誤和 JSON 訊息
      res.status(500).json({ error: '伺服器錯誤' });
      return;
    }
    // 成功：回傳 200 狀態碼和 "JSON 格式" 的 results
    res.status(200).json(results);
  });
});
// 路由 B：POST /add-message (接收表單資料)
app.post('/add-message', (req, res) => {
  const username = req.body.username_field;
  const content = req.body.content_field;
  const sql = "INSERT INTO messages (username, content) VALUES (?, ?)";
  const values = [username, content];
  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error('新增資料時發生錯誤:', err);
      res.status(500).send('伺服器錯誤'); 
      return;
    }   
    console.log('一則新留言已新增，ID:', results.insertId);
    // 新增成功後，導回首頁 (/)
    // 瀏覽器會重新載入 index.html，並觸發 <script> 重新載入資料
    res.redirect('/');
  });
});
// --- 5. 啟動伺服器 ---
app.listen(port, () => {
  console.log(`伺服器已啟動，請在瀏覽器開啟 http://localhost:${port}`);
});
