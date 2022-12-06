const mysql = require('mysql2')
require('dotenv').config()

const pool = mysql.createPool({
  // use your local environment when in development
  host: 'localhost',
  user: 'root',
  database: 'movieDB',
  password: 'password',
})
module.exports = pool.promise()
