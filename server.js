require('dotenv').config() // ALLOWS ENVIRONMENT VARIABLES TO BE SET ON PROCESS.ENV SHOULD BE AT TOP
const bodyParser = require('body-parser')
const session = require('express-session')
const express = require('express')
const cookieParser = require('cookie-parser')
const app = express()

app.enable('trust proxy')

app.use(express.json({})) // parse json bodies in the request object
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Origin', req.headers.origin)
  res.header(
    'Access-Control-Allow-Methods',
    'GET,PUT,POST,DELETE,UPDATE,OPTIONS'
  )
  res.header(
    'Access-Control-Allow-Headers',
    'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept'
  )
  next()
})

// Middleware
//allow cookie transfers
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(
  session({
    secret: 'secret',
    resave: false,
    // proxy: true,
    key: 'crud-mk11-chris',
    saveUninitialized: false,
    cookie: {
      expires: 1000 * 3600 * 24,
      // secure: true, // required for cookies to work on HTTPS
      // httpOnly: false,
      // sameSite: 'none',
    },
  })
)

app.use('/users', require('./routes/userRoutes'))

app.use((err, req, res, next) => {
  console.log(err.stack)
  console.log(err.name)
  console.log(err.code)

  res.status(500).json({
    error: 'Something went rely wrong',
  })
})

// Listen on pc port
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`))
