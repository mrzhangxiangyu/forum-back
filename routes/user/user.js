var express = require('express')
var router = express.Router()
var db = require('../../db')
var uuid = require('node-uuid')
var func = require('../../function/function')
var fs = require('fs')
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
  let data = func.deepClone(defaultData)
  console.log(req.query)
  db.retrieve('select * from user where userId = "' + req.query.userId + '"').then( e => {
    let {err, ret} = e
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
  let id = uuid.v1()
  let {account, password, nickname} = req.body
  if(account === undefined || password === undefined || nickname === undefined)
    judge = false
  let data = func.deepClone(defaultData)
  let postData = { ...req.body, userId: id}
  if (judge) {
    db.create('user', postData).then( e => {
      let {err, ret} = e
      if (err) {
        data.meta.status = false
        data.meta.info = err
        if (parseInt(err.sqlState) === 23000)
          data.meta.info = '登录账号已存在，请重新输入'
      } else {
        data.data.push(id)
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
  let data = func.deepClone(defaultData)
  let body = req.body
  let id = {userId: '"' + req.body.userId + '"'}
  delete body.userId
  for (let item in body) {
    if (body[item] === 'null' || body[item] === null) {
      delete body[item]
    }
  }
  console.log(body)
  db.update('user', body, id).then( e => {
    let {err, ret} = e
    if (err) {
      data.meta.info = err
    } else {
      data.data = []
      data.meta.status = true
      data.meta.info = '修改成功'
    }
    res.json(data)
  })
})
router.post('/test', function(req, res, next) {
  res.json({1:1})
})
router.put('/avatar', function(req, res, next) {
  let data = func.deepClone(defaultData)
  let {base64, userId} = req.body
  if (base64 !== '' && base64 !== undefined) {
    let imgId = Date.now() + '.jpg'
    let dataBuffer = new Buffer(base64, 'base64')
    fs.writeFile('public/images/' + imgId, dataBuffer, function(err){
      if(err) {
        data.meta.info = '图片保存失败'
        res.json(data)
      } else {
        db.update('user', {avatar: imgId}, {userId: '"' + userId + '"'}).then(e => {
          if (e.err) {
            data.meta.info = '图片保存失败'
            res.json(data)
          } else {
            data.meta.status = true
            data.data = imgId
            res.json(data)
          }
        })
      }
    })
  } else {
    res.json(data)
  }
})
router.delete('/', function(req, res, next) {
  let data = func.deepClone(defaultData)
  db.update('user', {status: 2}, req.query).then( e => {
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
router.get('/article', function(req, res, next) {
  let data = func.deepClone(defaultData)
  db.sql('select * from article where id in (' + req.query.id + ') and status = 1').then(async (e) => {
    let {err, ret} = e
    if (!err) {
      for (let i = 0; ret[i] !== undefined; i++) {
        let comments = []
        if (ret[i].commentId !== null && ret[i].commentId !== '') {
          comments = await getComments(ret[i].commentId)
        }
        ret[i].comments = comments
        ret[i].likedId = ret[i].likedId === null ? [] : ret[i].likedId.split(',')
        ret[i].favoritedId = ret[i].favoritedId === null ? [] : ret[i].favoritedId.split(',')
      }
      data.data = ret.reverse()
      data.meta.status = true
      res.json(data)
    } else {
      data.meta.info = err
      res.json(data)
    }
  })
})
router.get('/favorite', async function(req, res, next) {
  let data = func.deepClone(defaultData)
  if (req.query.id !== '' && req.query.id !== null && req.query.id !== undefined) {
    let ret = []
    const id = req.query.id.split(',')
    for (let i = 0; id[i] !== undefined; i++) {
      const e = await db.sql('select * from article where id = "' + id[i] + '"')
      ret.push(e.ret[0])
    }
    ret = ret.reverse()
    for (let i = 0; ret[i] !== undefined; i++) {
      if (ret[i].status === 1) {
        let comments = []
        if (ret[i].commentId !== null && ret[i].commentId !== '') {
          comments = await getComments(ret[i].commentId)
        }
        ret[i].comments = comments
        ret[i].likedId = ret[i].likedId === null ? [] : ret[i].likedId.split(',')
        ret[i].favoritedId = ret[i].favoritedId === null ? [] : ret[i].favoritedId.split(',')
      } else {
        ret[i].imgUrl = ''
        ret[i].likedId = ret[i].likedId === null ? [] : ret[i].likedId.split(',')
        ret[i].favoritedId = ret[i].favoritedId === null ? [] : ret[i].favoritedId.split(',')
        ret[i].comments = []
        ret[i].content = ''
        ret[i].commentNum = 0
      }
    }
    data.data = ret
  } else {
    data.data = []
  }
  data.meta.status = true
  res.json(data)
})
router.get('/comment', async function(req, res, next) {
  let data = func.deepClone(defaultData)
  let id = req.query.id
  if (id !== '' && id !== null && id !== undefined) {
    let ret = await db.retrieve('select * from comments where id in (' + id + ')')
    if (ret.err) {
      data.meta.status = false
      data.meta.info = ret.err
    } else {
      let comments = ret.ret
      for (let i = 0; comments[i] !== undefined; i++) {
        const e = await db.sql('select * from article where id = "' + comments[i].articleId + '"')
        let article = e.ret[0]
        if (article.status === 1) {
          let comments1 = []
          if (article.commentId !== null && article.commentId !== '') {
            comments1 = await getComments(article.commentId)
          }
          article.comments = comments1
          article.likedId = article.likedId === null ? [] : article.likedId.split(',')
          article.favoritedId = article.favoritedId === null ? [] : article.favoritedId.split(',')
        } else {
          article.imgUrl = ''
          article.likedId = article.likedId === null ? [] : article.likedId.split(',')
          article.favoritedId = article.favoritedId === null ? [] : article.favoritedId.split(',')
          article.comments = []
          article.content = ''
          article.commentNum = 0
        }
        comments[i].article = article
      }
      data.data = comments.reverse()
      data.meta.status = true
    }
  } else {
    data.data = []
    data.meta.status = true
  }
  res.json(data)
})
router.delete('/comment', async function(req,res,next) {
  let data = func.deepClone(defaultData)
  await db.delete('comments', {id: '"' + req.query.id + '"'})
  let e = await db.retrieve('select commentId from user where userId = "' + req.query.userId + '"')
  let commentId = e.ret[0].commentId.split(',')
  commentId = commentId.filter(value => {
    return value === req.query.id ? false : true
  }).join(',')
  let a = await db.update('user', {commentId: commentId}, {userId: "'" + req.query.userId + "'"})
  let b = await db.retrieve('select commentNum,commentId from article where id = "' + req.query.articleId + '"')
  let articleCommentNum = b.ret[0].commentNum - 1
  let articleCommentId = b.ret[0].commentId.split(',')
  articleCommentId = articleCommentId.filter(value => {
    return parseInt(value) === parseInt(req.query.id) ? false : true
  }).join(',')
  console.log(articleCommentNum,articleCommentId)
  let c = await db.update('article', {commentNum: articleCommentNum, commentId: articleCommentId}, {id: '"' + req.query.articleId + '"'})
  if (a.err || c.err)
    data.meta.status = false
  else
    data.meta.status = true
  res.json(data)
})
async function getComments(id) {
  return new Promise((res, rej) => {
    db.retrieve('select * from comments where id in (' + id + ')').then( async (e) => {
      let error = e.err
      let result = e.ret
      if (error) {
        rej(error)
      } else {
        if (result.length > 0)
          result = result.reverse()
        for (let i = 0; result[i] !== undefined; i++) {
          let user = await getUser(result[i].userId)
          result[i].userNickname = user.nickname
          result[i].avatar = user.avatar
        }
        res(result)
      }
    })
  })
}
function getUser(userId) {
  return new Promise((res, rej) => {
    db.retrieve('select * from user where userId = "' + userId + '"').then( e => {
      let {err, ret} = e
      if (err) {
        rej(err)
      } else {
        res(ret[0])
      }
    })
  })
}
module.exports = router
