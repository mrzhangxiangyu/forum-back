var express = require('express')
var router = express.Router()
var db = require('../../db')
/* GET users listing. */
let defaultData = {
  data: [],
  meta: {
    status: false,
    info: ''
  }
}
router.get('/', function(req, res, next) {
  let data = defaultData
  db.retrieve('select * from admin where account = "' + req.query.account + '"', (err, ret) => {
    if (err) {
      data.meta.info = err
    } else {
      if (ret.length === 0) {
        data.meta.status = false
        data.meta.info = '未找到该用户'
      } else {
        if (ret[0].password === req.query.password) {
          data.meta.status = true
          data.meta.info = '登陆成功'
        } else {
          data.meta.status = false
          data.meta.info = '密码错误'
        }
      }
    }
    res.json(data)
  })
})
module.exports = router
