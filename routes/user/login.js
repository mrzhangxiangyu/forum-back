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
router.post('/', function(req, res, next) {
  let data = defaultData
  console.log(req.body)
  db.retrieve('select * from user where account = "' + req.body.account + '"', (err, ret) => {
    if (err)
      data.meta.info = err
    else {
      console.log(ret)
      if (ret.length === 0) {
        data.meta.status = false
        data.meta.info = '未找到该用户'
      } else {
        if (ret[0].password === req.body.password) {
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
