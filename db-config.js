// 這個檔案專門存放資料庫的連線設定
// 讓 read.js 和 add.js 可以共用
const dbConfig = {
  host: '10.232.73.222',   // 資料庫 IP 位址
  port: 8878,              // MySQL 自訂連接埠
  user: 'std_7',       //學生的帳號
  password: 'pwd@BDstd',    // 學生的密碼
  database: 'guestbook_30517',// 資料庫名稱
};
// 匯出這個設定物件
module.exports = dbConfig;