var express = require('express')
var router = express.Router()
var db = require('../../db')
var func = require('../../function/function')
var fs = require('fs')
const defaultData = {
  data: [],
  meta: {
    status: false,
    info: ''
  }
}

async function getComments(id) {
  return new Promise((res, rej) => {
    db.retrieve('select * from comments where id in (' + id + ')').then( async (e) => {
      let error = e.err
      let result = e.ret
      if (error) {
        console.log(error)
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

// 获取文章列表
router.get('/', async function (req, res, next){
  let data = func.deepClone(defaultData)
  db.retrieve('select * from article where typeId = "' + req.query.type + '" and status = 1 order by updateTime ASC').then( async (e) => {
    let {err, ret} = e
    if (err) {
      data.meta.info = err
    } else {
      if (ret.length > 0)
        ret = ret.reverse()
      for (let i = 0; ret[i] !== undefined; i++) {
        let comments = []
        if (ret[i].commentId !== null && ret[i].commentId !== '') {
          comments = await getComments(ret[i].commentId)
        }
        ret[i].comments = comments
        ret[i].likedId = ret[i].likedId === null ? [] : ret[i].likedId.split(',')
        ret[i].favoritedId = ret[i].favoritedId === null ? [] : ret[i].favoritedId.split(',')
      }
      data.data = ret
      data.meta.status = true
      data.meta.info = ''
    }
    res.json(data)
  })
})

// 写文章
router.post('/', function(req, res, next) {
  let judge = true
  let {imgBase64, title, content, userId, typeId} = req.body
  let data = func.deepClone(defaultData)
  let id = Date.now()
  let now = new Date()
  let time = now.toLocaleDateString().replace('/', '-') + ' ' + now.toLocaleTimeString()
  let postData = { imgUrl: '', title: title, content: content, id: id, userId: userId, time: time, typeId: typeId }
  if(imgBase64 === undefined || title === undefined || content === undefined || userId === undefined || typeId === undefined) {
    judge = false
    data.meta.info = '输入参数不正确'
  }
  if (imgBase64 !== '') {
    let imgId = Date.now() + '.jpg'
    postData.imgUrl = imgId
    let dataBuffer = new Buffer(imgBase64, 'base64')
    fs.writeFile('public/images/' + imgId, dataBuffer, function(err){
      if(err) {
        data.meta.info = '图片保存失败'
        judge = false
      }
    })
  }
  if (judge) {
    db.create('article', postData).then( e => {
      let {err, ret} = e
      if (err) {
        data.meta.info = err
      } else {
        data.meta.status = true
        data.meta.info = '发表成功'
      }
      db.retrieve('select * from user where userId = "' + userId + '"').then( e => {
        if (!e.err) {
          let publishId = e.ret[0].publishId
          publishId = publishId === null ? id : publishId + ',' + id
          db.update('user', {publishId: publishId}, {userId: '"' + userId + '"'})
        }
      })
      res.json(data)
    })
  } else {
    res.json(data)
  }
})

// 修改文章
router.put('/', function(req, res, next) {
  let data = func.deepClone(defaultData)
  let body = req.body
  let id = { id: '"' + body.id + '"' }
  delete body.id
  db.update('article', body, id).then( e => {
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

//删除文章
router.delete('/', function(req, res, next) {
  let data = func.deepClone(defaultData)
  let id = JSON.parse(req.query.id)
  let ids = ''
  id.map((item, index) => {
    if (index === 0)
      ids += ('"' + item + '"')
    else
      ids += ',' + ('"' + item + '"')
  })
  db.sql('update article set status = 2 where id in (' + ids + ')').then( e => {
    let {err, ret} = e
    if (err) {
      data.meta.status = false
      data.meta.info = err
    } else {
      data.data = []
      data.meta.status = true
      data.meta.info = '删除成功'
    }
    res.json(data)
  })
})

//文章评论
router.post('/comment', function(req, res, next) {
  let data = func.deepClone(defaultData)
  let insert = func.deepClone(req.body)
  let now = new Date()
  let time = now.toLocaleDateString().replace('/', '-') + ' ' + now.toLocaleTimeString()
  insert.time = time
  // 向数据库插入一条新的评论
  db.create('comments', insert).then( result => {
    let {err, ret} = result
    if (err) {
      data.meta.info = err
      res.json(data)
    } else {
      // 把这条评论挂在文章上面
      db.retrieve('select * from article where id = "' + insert.articleId + '"').then( e => {
        let err1 = e.err
        let ret1 = e.ret
        if (err1) {
          data.meta.info = err
          res.json(data)
        } else {
          let commentId, commentNum
          if (ret1[0].commentId === null || ret1[0].commentId === '') {
            commentId = ret.insertId
          } else {
            commentId = ret1[0].commentId + ',' + ret.insertId
          }
          commentNum = parseInt(ret1[0].commentNum) + 1
          const set = { commentId: commentId, commentNum: parseInt(commentNum) }
          const where = { id: insert.articleId}
          db.update('article', set, where).then( e => {
            let error = e.err
            let result = e.ret
            if (error) {
              data.meta.info = error
              res.json(data)
            } else {
              delete insert.articleId
              data.data = insert
              data.meta.status = true
              data.meta.info = '评论成功'
              res.json(data)
            }
          })
        }
      })
      // 把这条评论挂在用户下面
      db.retrieve('select commentId from user where userId = "' + req.body.userId + '"').then( e => {
        if (!e.err) {
          let commentId = e.ret[0].commentId
          commentId = (commentId === null || commentId === '') ? ret.insertId : commentId + ',' + ret.insertId
          db.update('user', {commentId: commentId}, {userId: '"' + req.body.userId + '"'})
        } else {
          // console.log(err)
        }
      })
    }
  })
})
// 文章点赞
router.put('/like', function(req, res, next) {
  let data = func.deepClone(defaultData)
  db.retrieve('select likeNum, likedId from article where id = "' + req.body.id + '"').then(e => {
    if (!e.err) {
      let {likeNum, likedId} = e.ret[0]
      if (req.body.type === 1) {
        let num = likeNum + 1
        let id = (likedId === null || likedId === '') ? req.body.userId : likedId + ',' + req.body.userId
        db.update('article', {likeNum: num, likedId: id}, {id: '"' + req.body.id + '"'})
      } else {
        let num = likeNum - 1
        let arr1 = likedId.split(',')
        let arr2 = arr1.filter((value) => {
          return value === req.body.userId ? false : true
        })
        let id = arr2.join(',')
        db.update('article', {likeNum: num, likedId: id}, {id: '"' + req.body.id + '"'})
      }
    } else {
      // console.log(e.err)
    }
  })
  data.meta.status = true
  res.json(data)
})
router.put('/favorite', function(req, res, next) {
  let data = func.deepClone(defaultData)
  db.retrieve('select favoriteNum,favoritedId from article where id = "' + req.body.id + '"').then(e => {
    if (!e.err) {
      let {favoriteNum, favoritedId} = e.ret[0]
      if (req.body.type === 1) {
        let num = favoriteNum + 1
        let id = (favoritedId === null || favoritedId === '') ? req.body.userId : favoritedId + ',' + req.body.userId
        db.update('article', {favoriteNum: num, favoritedId: id}, {id: '"' + req.body.id + '"'})
        db.retrieve('select favoritedId from user where userId = "' + req.body.userId + '"').then( ret1 => {
          if (!ret1.err) {
            let id1 = ret1.ret[0].favoritedId
            id1 = (id1 === null || id1 === '') ? req.body.id : id1 + ',' + req.body.id
            db.update('user', {favoritedId: id1}, {userId: '"' + req.body.userId + '"'}).then( () => {
              data.meta.status = true
              res.json(data)
            })
          }
        })
      } else {
        let num = favoriteNum - 1
        let arr1 = favoritedId.split(',')
        let arr2 = arr1.filter((value) => {
          return value === req.body.userId ? false : true
        })
        let id = arr2.join(',')
        db.update('article', {favoriteNum: num, favoritedId: id}, {id: '"' + req.body.id + '"'})
        db.retrieve('select favoritedId from user where userId = "' + req.body.userId + '"').then( ret1 => {
          if (!ret1.err) {
            let id1 = ret1.ret[0].favoritedId
            let arr1 = id1.split(',')
            let arr2 = arr1.filter((value) => {
              return (value === req.body.id || value === 'null') ? false : true
            })
            id1 = arr2.join(',')
            db.update('user', {favoritedId: id1}, {userId: '"' + req.body.userId + '"'}).then(() => {
              data.meta.status = true
              res.json(data)
            })
          }
        })
      }
    } else {
      data.meta.info = e.err
      res.json(data)
      // console.log(e.err)
    }
  })
})
router.get('/hot', async function(req, res, next) {
  let data = func.deepClone(defaultData)
  db.retrieve('select * from article where status = 1').then(async (e) => {
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
        ret[i].hotValue = ret[i].likeNum + ret[i].favoriteNum + ret[i].commentNum
      }
      let arr = func.deepClone(ret)
      let result = []
      for( let i = 0; i < ret.length; i++) {
        let max = 0
        for (let j = 0; arr[j] !== undefined; j++) {
          if (arr[j].hotValue > arr[max].hotValue) {
            max = j
          }
        }
        result.push(arr[max])
        arr.splice(max, 1)
      }
      data.data = result
      data.meta.status = true
      res.json(data)
    } else {
      data.meta.info = err
      res.json(data)
    }
  })
})
router.get('/search', function(req, res, next) {
  let data = func.deepClone(defaultData)
  db.sql('select * from article where title like "%' + req.query.txt + '%"').then( async (e) => {
    if (!e.err) {
      let ret = e.ret
      for (let i = 0; ret[i] !== undefined; i++) {
        let comments = []
        if (ret[i].commentId !== null && ret[i].commentId !== '') {
          comments = await getComments(ret[i].commentId)
        }
        ret[i].comments = comments
        ret[i].likedId = ret[i].likedId === null ? [] : ret[i].likedId.split(',')
        ret[i].favoritedId = ret[i].favoritedId === null ? [] : ret[i].favoritedId.split(',')
      }
      data.data = ret
      data.meta.status = true
      res.json(data)
    }
  })
})
module.exports = router
