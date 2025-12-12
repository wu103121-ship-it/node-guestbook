// --- 1. 載入套件 ---
const express = require('express');
const mysql = require('mysql2');
const path = require('path'); // (新) 載入 path 模組
const dbConfig = require('./db-config');

// 設定樣板引擎為 EJS
app.set('view engine', 'ejs');

// --- 2. 建立 Express 應用程式和連線 ---
const app = express();
const port = 80;
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

// --- 路由 3. 個人頁面展示  ---
app.get('/profile/:username', (req, res) => {  
    // 1. 抓取網址上的參數
    const username = req.params.username;

    // 2. 第一步：去 users 資料庫找這個人
    connection.query('SELECT * FROM users WHERE username = ?', [username], (err, users) => {        
        // 2-1. 檢查資料庫連線錯誤
        if (err) {
            console.error('查詢使用者失敗:', err);
            return res.status(500).send('伺服器發生錯誤');
        }

        // 2-2. 檢查有沒有找到人
        if (users.length === 0) {
            return res.status(404).send('<h1>404 - 查無此人</h1>');
        }

        // 3. 找到了！取出使用者資料
        const user = users[0];

        // 4. 第二步：拿這個人的 user_id 去 posts 資料庫找貼文
        const sqlPosts = 'SELECT content FROM posts WHERE user_id = ?';
       
        connection.query(sqlPosts, [user.user_id], (err, posts) => {            
            // 4-1. 檢查貼文查詢錯誤
            if (err) {
                console.error('查詢貼文失敗:', err);
                return res.status(500).send('讀取貼文失敗');
            }

            // 5. 資料整形 (Mapping)
            const userData = {
                name: user.display_name,    
                bio: user.bio,
                avatar: user.avatar_url,    
                friends: user.friends_count,
                // 把資料庫撈出來的物件陣列，轉成 EJS 看得懂的純文字陣列
                posts: posts.map(row => row.content)
            };

            // 6. 渲染畫面
            // 重點：除了 data 之外，我們多傳了 id (user.username)
            // 這樣 edit.ejs 裡的「修改按鈕」才知道要連去哪裡
            res.render('profile', {
                data: userData,
                id: user.username
            });
        });
    });
});
// --- 搜尋處理 (GET 練習) ---
// 當使用者在首頁按下搜尋，網址會變成 /search?keyword=lee
app.get('/search', (req, res) => {
    // 1. 接球：從網址問號後面抓出 keyword
    const keyword = req.query.keyword;

    // 2. 處理：去資料庫檢查有沒有這個 username
    // SQL: 選取所有資料，條件是 username 等於關鍵字
    const sql = 'SELECT * FROM users WHERE username = ?';
    connection.query(sql, [keyword], (err, results) => {
        if (err) {
            console.error(err);
            return res.send('資料庫搜尋錯誤');
        }

        // 3. 判斷有沒有找到人
        if (results.length > 0) {
            // 有這個人，直接跳轉 (Redirect) 到他的個人頁面
            res.redirect(`/profile/${keyword}`);
        } else {
            // 找不到人
            res.send(`<h1>找不到使用者 ID：${keyword}</h1><br><a href="/SNS">回 SNS 首頁重搜</a>`);
        }
    });
});

// --- 修改頁面 (顯示表單) ---
app.get('/edit/:username', (req, res) => {
    const username = req.params.username;

    // 我們需要先從資料庫抓出「目前的簡介」，這樣使用者才不用全部重打
    connection.query('SELECT bio FROM users WHERE username = ?', [username], (err, results) => {
        if (err) return res.send('讀取資料錯誤');

        if (results.length > 0) {
            // 渲染 edit.ejs
            // id: 傳過去放在 hidden input 用的
            // currentBio: 顯示在畫面上的舊資料
            res.render('edit', { id: username, currentBio: results[0].bio });
        } else {
            res.send('找不到人，無法編輯');
        }
    });
});

// --- 接收修改資料 (POST 練習) ---
app.post('/update-bio', (req, res) => {
    // 1. 拆信：從 req.body 拿出資料
    const username = req.body.myID;     // 來自 hidden input (對應 SQL 的 username)
    const newBio = req.body.newBio;     // 來自 text input

    // 2. 修改資料庫 (最重要的一步！)
    // SQL: 更新 users 表格，設定 bio 為新值，條件是 username 符合
    const sql = 'UPDATE users SET bio = ? WHERE username = ?';

    connection.query(sql, [newBio, username], (err, results) => {
        if (err) {
            console.error(err);
            return res.send('更新失敗');
        }

        console.log(`[系統紀錄] 使用者 ${username} 資料已更新`);

        // 3. 導回個人頁面，讓使用者看到修改後的結果
        // 這樣使用者會感覺畫面「刷新」了，且資料變了
        res.redirect(`/profile/${username}`);
    });
});



// --- 5. 啟動伺服器 ---
app.listen(port, () => {
  console.log(`伺服器已啟動，請在瀏覽器開啟http://localhost:${port}` );
});
