var express = require('express')
var router = express.Router()
var db = require('../../db')
var func = require('../../function/function')
var adminUsers = require('./users')
var adminArticles = require('./articles')
var adminTypes = require('./types')
router.use('/users', adminUsers)
router.use('/articles', adminArticles)
router.use('/types', adminTypes)
/* GET users listing. */
let defaultData = {
  data: [],
  meta: {
    status: false,
    info: ''
  }
}
router.get('/login', function(req, res, next) {
  let data = func.deepClone(defaultData)
  db.retrieve('select * from admin where account = "' + req.query.account + '"').then(e => {
    let {err, ret} = e
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
