var express = require('express')
var router = express.Router()
var func = require('../../function/function')
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
  let data = func.deepClone(defaultData)
  db.retrieve('select * from article where status = 1').then( e => {
    let {err, ret} = e
    if (err) {
      data.meta.info = err
    } else {
      data.data = ret
      data.meta.status = true
    }
    res.json(data)
  })
})
module.exports = router
