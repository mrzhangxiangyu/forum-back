var express = require('express')
var router = express.Router()
var db = require('../db')
var user = require('./user/user')

/* GET home page. */
router.use('/user', user)

module.exports = router;
