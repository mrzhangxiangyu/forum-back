var express = require('express')
var router = express.Router()
var db = require('../../db')
var func = require('../../function/function')
let defaultData = {
  data: [],
  meta: {
    status: false,
    info: ''
  }
}
router.get('/', function(req, res, next) {
  let data = func.deepClone(defaultData)
  db.retrieve('select * from type').then( e => {
    if (e.err) {
      data.meta.info = e.err
    } else {
      data.meta.status = true
      data.data = e.ret
    }
    res.json(data)
  })
})
router.post('/', function(req, res, next) {
  let data = func.deepClone(defaultData)
  db.create('type', req.body).then( e => {
    if (e.err) {
      data.meta.info = e.err
    } else {
      data.meta.status = true
      data.data = e.ret
    }
    res.json(data)
  })
})
router.delete('/', function(req, res, next) {
  let data = func.deepClone(defaultData)
  db.delete('type', req.query).then(e => {
    if (e.err) {
      data.meta.info = e.err
    } else {
      data.meta.status = true
      data.data = e.ret
    }
    res.json(data)
  })
})
module.exports = router