const express = require('express')
const app = express()
const winston = require('winston')
const PORT = process.env.PORT || 1338
const http = require('http').Server(app)
const io = require('socket.io')(http)
const bodyParser = require('body-parser')
const path = require('path')
const cookieParser = require('cookie-parser')

app.use(bodyParser.json()) // for parsing application/json
app.use(cookieParser())

// serve the website
app.use('/', express.static(path.join(__dirname, 'public')))

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'public'))
})

io.on('connection', function (socket) {
  winston.info('user connected')
  socket.on('SendingMessage', function (data) {
    io.emit('Message from server', {data})
  })

  socket.on('Realtime feeding', function (data) {
    socket.broadcast.emit('Realtime type feedback', {data})
  })
  socket.on('VideoStream', function (data) {
    console.log(data)
    io.emit('VideoStreamrecieved', {data})
  })
})

http.listen(PORT, function () {
  winston.info(`Server started listening on ${PORT}`)
})
