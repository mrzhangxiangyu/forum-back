const request=require("request")  
const cheerio=require("cheerio")  
const pool = require('../db')

const rep = function(item){
  request('https://www.qidian.com/rank?chn=21',function(err,res){ 
    if (err) {
      console.log('请求出错')
    } else{
      var $ = cheerio.load(res.body, {decodeEntities: false})
      // console.log($('li[asas=test]').html())
      console.log($('div.rank-list').length)
      $('div.rank-list').each((i, e) => {
        const a = $(e).find('h3').text()
        console.log(a.split('更多')[0])
        $(e).find('a.name').each((i, book) => {
          console.log('   '+$(book).text())
        })
      })
      pool.getConnection((err, conn) => {
        if (err) {
          console.log(err)
        } else {
          conn.query('insert into novel(title, titleUrl, type) values("test", "test", "test")', (err, result, fields) => {
            if (err) {
              console.log(err)
            } else {
              console.log(result)
            }
            // 释放连接
            conn.release()
          })
        }
      })
    }
  })
}
module.exports = rep