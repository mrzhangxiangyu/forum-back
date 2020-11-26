var mysql = require('mysql')
var pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  database: 'forum',
  user: 'root',
  password: '716926ab.c'
})

// table: 要插入的表名，datas: 要插入的信息-对象格式
let create = (table, datas) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) {
        resolve({err: err, ret: []})
      } else {
        var fields = ''
        var values = ''
        for( var k in datas){
          fields += k + ','
          values = values + "'" + datas[k] + "',"
        }
        fields = fields.slice(0, -1)
        values = values.slice(0, -1)
        var sql="INSERT INTO " + table + '(' + fields + ') VALUES(' + values + ')'
        conn.query(sql, (err, result) => {
          resolve({err: err, ret: result})
          // 释放连接
          conn.release()
        })
      }
    })
  })
}

// sql: sql语句
let retrieve = (sql) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) {
        resolve({err: err, ret: []})
      } else {
        conn.query(sql, (err, result) => {
          resolve({err: err, ret: result})
          // 释放连接
          conn.release()
        })
      }
    })
  })
}

// table: 要修改的表名，sets: 要修改的信息-{}，where: 原信息查找依据-{}
let update = (table, sets, where) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) {
        resolve({err: err, ret: []})
      } else {
        let _SETS=''
        let _WHERE=''
        for(let k in sets){
          _SETS += k + "='" + sets[k] + "',"
        }
        _SETS = _SETS.slice(0,-1)
        for(let k2 in where){
          _WHERE += k2 + "=" + where[k2]
        }
        let sql = "UPDATE " + table + ' SET ' + _SETS + ' WHERE ' + _WHERE
        conn.query(sql, (err, result) => {
          resolve({err: err, ret: result})
          // 释放连接
          conn.release()
        })
      }
    })
  })
}

// table: 要删除的表名，where: 要删除的信息的查找依据-{}
let del = (table, where) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) {
        resolve({err: err, ret: []})
      } else {
        let _WHERE=''
        for(let k2 in where){
          _WHERE += k2 + "=" + where[k2]
        }
        let sql = "DELETE  FROM " + table + ' WHERE ' + _WHERE
        conn.query(sql, (err, result) => {
          resolve({err: err, ret: result})
          // 释放连接
          conn.release()
        })
      }
    })
  })
}
let sql = (sql) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) {
        resolve({err: err, ret: []})
      } else {
        conn.query(sql, (err, result) => {
          resolve({err: err, ret: result})
          // 释放连接
          conn.release()
        })
      }
    })
  })
}
exports.create = create
exports.retrieve = retrieve
exports.update = update
exports.delete = del
exports.sql = sql