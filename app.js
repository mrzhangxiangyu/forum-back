var createError = require('http-errors')
var express = require('express')
var path = require('path')
var ejs = require('ejs')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var router = require('./routes/index')
var bodyParser = require('body-parser')

var app = express();
//设置允许跨域访问该服务.
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  // Access-Control-Allow-Headers ,可根据浏览器的F12查看,把对应的粘贴在这里就行
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  res.header('Content-Type', 'application/json;charset=utf-8')
  next()
})
// view engine setup
// app.set('views', path.join(__dirname, 'views'))
// app.set('view engine', 'ejs')
app.engine('html', require('ejs').__express)
app.set('view engine', 'html')
// 解决上传文件过大的问题
app.use(bodyParser.urlencoded({ 'limit':'10000kb', extended: true})) //根据需求更改limit大小
app.use(bodyParser.json({ 'limit':'10000kb'}))
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
// app.use(express.static('public'))
app.use(express.static('public/dist'))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/api', router)

app.use(function(req, res, next) {
  next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
