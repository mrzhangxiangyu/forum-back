var express = require('express')
var router = express.Router()
var db = require('../db')

/* GET users listing. */
router.get('/test', function(req, res) {
  const a = req.query
  // res.send(query('select * from novel where id = 1'))
})

router.post('/test', function(req, res) {
  const a = req.body
  res.send(a)
})

module.exports = router