var express = require('express')
var router = express.Router()
var db = require('../db')

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
        data.meta.info = ''
      }
    }
    res.json(data)
  })
})
router.post('/', function(req, res, next) {
  let data = defaultData
  console.log(req.body)
  
  db.create('user', req.body, (err, ret) => {
    if (err) {
      data.meta.info = err
    } else {
      console.log(ret)
      data.data = []
      data.meta.status = true
      data.meta.info = ''
    }
    res.json(data)
  })
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
      data.meta.info = ''
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
      console.log(ret)
      data.data = []
      data.meta.status = true
      data.meta.info = ''
    }
    res.json(data)
  })
})
module.exports = router
