var express = require('express')
var router = express.Router()
var func = require('../../function/function')
var db = require('../../db')
var uuid = require('node-uuid')
/* GET users listing. */
let defaultData = {
  data: [],
  meta: {
    status: false,
    info: ''
  }
}
router.get('/', function(req, res, next) {
  let data = func.deepClone(defaultData)
  db.retrieve('select * from user where status = 1').then( e => {
    let {err, ret} = e
    if (err) {
      data.meta.info = err
    } else {
      data.data = ret
      data.meta.status = true
      data.meta.info = ''
    }
    res.json(data)
  })
})

router.post('/', function(req, res, next) {
  let judge = true
  let {account, password, nickname} = req.body
  if(account === undefined || password === undefined || nickname === undefined)
    judge = false
  let data = func.deepClone(defaultData)
  let id = uuid.v1()
  let postData = { account: account, password: password, nickname: nickname, userId: id }
  if (judge) {
    db.create('user', postData).then( e => {
      let {err, ret} = e
      if (err) {
        data.meta.info = err
      } else {
        data.data.push(id)
        data.meta.status = true
        data.meta.info = '添加成功'
      }
      res.json(data)
    })
  } else {
    data.meta.info = '输入参数不正确'
    res.json(data)
  }
})
router.put('/', function(req, res, next) {
  let data = func.deepClone(defaultData)
  let body = req.body
  let id = {userId: req.body.userId}
  delete body.userId
  db.update('user', body, id).then( e => {
    let {err, ret} = e
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
  let data = func.deepClone(defaultData)
  let id = JSON.parse(req.query.id)
  let ids = ''
  id.map((item, index) => {
    if (index === 0)
      ids = ids + '"' + item + '"'
    else
      ids = ids + ',' + '"' + item + '"'
  })
  db.sql('UPDATE user SET status = 2 WHERE userId in (' + ids + ')').then( e => {
    let {err, ret} = e
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
