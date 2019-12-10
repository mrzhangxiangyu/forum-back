const db = require('../db')
const test = () => {
  let data = {
    userName: '002',
    loginName: '002',
    loginPassword: '123456'
  }
  db.update('user', data, {userId: 1}, (err, res) => {
    if (err) {
      console.log('err')
    } else {
      console.log(res)
    }
  })
}
module.exports = test