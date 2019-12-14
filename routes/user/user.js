var express = require('express')
var router = express.Router()
var db = require('../../db')
var userLogin = require('./login')
router.use('/login', userLogin)
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
  console.log(req.query)
  db.retrieve('select * from user where userId = ' + parseInt(req.query.userId), (err, ret) => {
    if (err) {
      data.meta.info = err
    } else {
      if (ret.length === 0) {
        data.data = []
        data.meta.status = false
        data.meta.info = '未找到该用户'
      } else {
        data.data = ret[0]
        data.meta.status = true
        data.meta.info = '查询成功'
      }
    }
    res.json(data)
  })
})
router.post('/', function(req, res, next) {
  let judge = true
  let {account, password, nickname} = req.body
  if(account === undefined || password === undefined || nickname === undefined)
    judge = false
  let data = defaultData
  if (judge) {
    db.create('user', req.body, (err, ret) => {
      if (err) {
        data.meta.info = err
      } else {
        data.meta.status = true
        data.meta.info = '注册成功'
      }
      res.json(data)
    })
  } else {
    data.meta.info = '输入参数不正确'
    res.json(data)
  }
})
router.put('/', function(req, res, next) {
  let data = defaultData
  let body = req.body
  let id = {userId: req.body.userId}
  delete body.userId
  db.update('user', body, id, (err, ret) => {
    if (err) {
      data.meta.info = err
    } else {
      console.log(ret)
      data.data = []
      data.meta.status = true
      data.meta.info = '修改成功'
    }
    res.json(data)
  })
})
router.delete('/', function(req, res, next) {
  let data = defaultData
  db.delete('user', req.query, (err, ret) => {
    if (err) {
      data.meta.info = err
    } else {
      data.data = []
      data.meta.status = true
      data.meta.info = '删除成功'
    }
    res.json(data)
  })
})
module.exports = router
