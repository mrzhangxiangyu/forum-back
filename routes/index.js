var express = require('express')
var router = express.Router()
var db = require('../db')
var user = require('./user/user')
var admin = require('./admin/admin')

/* GET home page. */
router.use('/user', user)
router.use('/admin', admin)

module.exports = router;
