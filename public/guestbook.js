// 這支 script 會在「瀏覽器」中執行，而不是在 Node.js 中執行
// 1. 定義一個函式來載入並顯示留言
async function loadMessages() {
    try {
        // 2. 使用 fetch 向我們的後端 API "請求" 資料
        const response = await fetch('/api/messages');       
        // 3. 將後端傳來的 JSON 回應轉為 JavaScript 陣列
        const messages = await response.json();
        // 4. 取得要放置留言的容器
        const listDiv = document.getElementById('messages-list');       
        // 5. (重要) 先清空
        listDiv.innerHTML = '';
        // 6. 遍歷 (loop) 留言陣列，動態產生 HTML
        if (messages.length === 0) {
            listDiv.innerHTML = '<p>目前沒有留言。</p>';
        } else {
            messages.forEach(message => {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'message-item';               
                // 處理時間格式
                const time = new Date(message.created_at).toLocaleString();               
                messageDiv.innerHTML = `
                    <p><strong>${message.username}</strong> 說：</p>
                    <p>${message.content}</p>
                    <small>${time}</small>
                `;
                listDiv.appendChild(messageDiv);
            });
        }
    } catch (error) {
        console.error('載入留言失敗:', error);
        document.getElementById('messages-list').innerHTML = '<p>載入留言失敗！</p>';
    }
}
// 7. 網頁載入完成時，自動執行 `loadMessages` 函式
document.addEventListener('DOMContentLoaded', loadMessages);
