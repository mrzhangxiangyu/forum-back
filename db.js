var mysql = require('mysql')
var pool = mysql.createPool({
  host: '47.106.234.110',
  port: 3306,
  database: 'test',
  user: 'root',
  password: '716926ab.c'
})
module.exports = pool