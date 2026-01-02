// --- 1. 載入套件 ---
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const dbConfig = require('./db-config');

// --- 2. 建立 Express 應用程式 (必須先建立 app) ---
const app = express();
const port = 3000;

// 建議改用 Pool 增加穩定性
const pool = mysql.createPool(dbConfig);
// 取得 promise 版本的連線 (方便使用 async/await，若你想進階的話)
const db = pool.promise(); 

// 設定樣板引擎
app.set('view engine', 'ejs');

// --- 3. 設定中介軟體 ---
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- 4. 路由設定 ---

// 路由 A：API 獲取所有留言
app.get('/api/messages', (req, res) => {
    const sql = "SELECT * FROM messages ORDER BY created_at DESC"; 
    pool.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: '伺服器錯誤' });
        res.status(200).json(results);
    });
});

// 路由 B：新增留言
app.post('/add-message', (req, res) => {
    const { username_field: username, content_field: content } = req.body;
    const sql = "INSERT INTO messages (username, content) VALUES (?, ?)";
    pool.query(sql, [username, content], (err) => {
        if (err) return res.status(500).send('伺服器錯誤');
        res.redirect('/');
    });
});

// 路由 C：個人頁面展示 (優化邏輯)
app.get('/profile/:username', (req, res) => {  
    const username = req.params.username;

    // 先找使用者
    pool.query('SELECT * FROM users WHERE username = ?', [username], (err, users) => {        
        if (err) return res.status(500).send('伺服器發生錯誤');
        if (users.length === 0) return res.status(404).send('<h1>404 - 查無此人</h1>');

        const user = users[0];
        // 拿 user_id 找貼文
        pool.query('SELECT content FROM posts WHERE user_id = ?', [user.user_id], (err, posts) => {            
            if (err) return res.status(500).send('讀取貼文失敗');

            res.render('profile', {
                id: user.username,
                data: {
                    name: user.display_name,    
                    bio: user.bio,
                    avatar: user.avatar_url,    
                    friends: user.friends_count,
                    posts: posts.map(row => row.content)
                }
            });
        });
    });
});

// 搜尋功能
app.get('/search', (req, res) => {
    const keyword = req.query.keyword;
    if (!keyword) return res.redirect('/');

    pool.query('SELECT username FROM users WHERE username = ?', [keyword], (err, results) => {
        if (err) return res.status(500).send('搜尋錯誤');
        if (results.length > 0) {
            res.redirect(`/profile/${results[0].username}`);
        } else {
            res.send(`<h1>找不到使用者：${keyword}</h1><br><a href="/">回首頁</a>`);
        }
    });
});

// 編輯頁面
app.get('/edit/:username', (req, res) => {
    const username = req.params.username;
    pool.query('SELECT bio FROM users WHERE username = ?', [username], (err, results) => {
        if (err || results.length === 0) return res.send('無法編輯');
        res.render('edit', { id: username, currentBio: results[0].bio });
    });
});

// 更新資料
app.post('/update-bio', (req, res) => {
    const { myID: username, newBio } = req.body;
    const sql = 'UPDATE users SET bio = ? WHERE username = ?';
    pool.query(sql, [newBio, username], (err) => {
        if (err) return res.status(500).send('更新失敗');
        res.redirect(`/profile/${username}`);
    });
});

// --- 5. 啟動 ---
app.listen(port, () => {
    console.log(`伺服器運行中: http://localhost:${port}`);
});