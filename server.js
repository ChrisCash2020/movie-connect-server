require('dotenv').config() // ALLOWS ENVIRONMENT VARIABLES TO BE SET ON PROCESS.ENV SHOULD BE AT TOP
const bodyParser = require('body-parser')
const session = require('express-session')
const express = require('express')
const cookieParser = require('cookie-parser')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

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
    proxy: true,
    name: 'crud-movie-chris',
    saveUninitialized: false,
    cookie: {
      expires: 1000 * 3600 * 24 * 30,
      secure: true, // required for cookies to work on HTTPS
      httpOnly: false,
      sameSite: 'none',
    },
  })
)
app.use('/public/uploads/', express.static('./public/uploads/'))
app.use('/users', require('./routes/userRoutes'))

app.use((err, req, res, next) => {
  console.log(err.stack)
  console.log(err.name)
  console.log(err.code)

  res.status(500).json({
    error: 'Something went rely wrong',
  })
})
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'UPDATE'],
    credentials: true,
  },
})

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`)

  socket.on('join_room', (data) => {
    socket.join(data)
    console.log(`User with ID: ${socket.id} joined room: ${data}`)
  })

  socket.on('send_message', (data) => {
    socket.to(data.roomId).emit('receive_message', data)
    console.log('sent')
  })

  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id)
  })
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`)
})
// Listen on pc port
// app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`))
