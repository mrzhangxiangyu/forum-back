var express = require('express')
var router = express.Router()
var db = require('../db')

/* GET home page. */
router.get('/', function(req, res, next) {
  let a = req.query
  db.retrieve('select * from user where userId = ' + parseInt(a.a), (err, ret) => {
    if (err) {
      let data = {
        data: [],
        meta: {
          status: false,
          info: err
        }
      }
      res.send(data)
    } else {
      let data = {
        data: ret[0],
        meta: {
          status: true,
          info: ''
        }
      }
      if (ret.length === 0) {
        data.data = []
        data.meta.status = false
        data.meta.info = '未找到该用户'
      }
      res.json(data)
    }
  })
})

module.exports = router;
