import io from 'socket.io-client'
let socket = io()
let recordedChunks = []

Notification.requestPermission().then(() => {
  console.log(Notification.permission)
})

socket.on('VideoStreamrecieved', function (res) {
  if (res.data.name !== localStorage.getItem('GigglerName')) {
    let video = document.querySelector('#recieve video')
    video.src = window.URL.createObjectURL(new Blob([res.data.data], { 'type': 'video/webm; codecs=vp8' }))
    video.onloadedmetadata = function (e) {
      notifyUser({name: res.data.name, message: 'Sent you a video message'})
      video.play()
    }
    document.querySelector('#recieve').style.display = 'block'
  }
})

socket.on('Realtime type feedback', function (data) {
  addToRealtimeLi(data.data)
})

socket.on('Message from server', function (data) {
  if (data.data.name !== localStorage.getItem('GigglerName')) {
    notifyUser(data.data)
  }
  addToChatBox(data.data)
})

function startChat () {
  localStorage.setItem('GigglerName', document.getElementById('GigglerName').value)

  window.location.href = 'gigglePage.html'
}

function sendChat () {
  sendMessageToServer(document.getElementById('giggleText').value)
}

function sendMessageToServer (text) {
  if (text) {
    document.getElementById('giggleText').value = ''
    socket.emit('SendingMessage', {message: text, name: localStorage.getItem('GigglerName')})
  }
}

function realTimeTypingFeed () {
  socket.emit('Realtime feeding', {message: document.getElementById('giggleText').value, name: localStorage.getItem('GigglerName')})
}

function addToRealtimeLi (data) {
  let span = document.getElementById('RealTimeSpan')
  span.innerHTML = data.name + 'is typing : ' + data.message
}

function mediarecorder (mediaStream) {
  var options = {mimeType: 'video/webm;codecs=vp8'}
  let mediaRecorder = new MediaRecorder(mediaStream, options)
  mediaRecorder.ondataavailable = handleDataAvailable
  mediaRecorder.start()
  return mediaRecorder
}
function initialiseSendVideoDisplay (mediaStream) {
  let video = document.querySelector('video#send')
  video.srcObject = mediaStream
  video.onloadedmetadata = function (e) {
    video.play()
  }
}
function handleDataAvailable (event) {
  if (event.data.size > 0) {
    recordedChunks.push(event.data)
    document.querySelector('video#send').style.display = 'none'
    socket.emit('VideoStream', {data: new Blob(recordedChunks, { 'type': 'video/webm; codecs=vp8' }), name: localStorage.getItem('GigglerName')})
  } else {
    // ...
  }
}

function onStartRecordClick () {
  document.querySelector('#startBtn').style.display = 'none'
  document.querySelector('#stopBtn').style.display = 'block'
  document.querySelector('video#send').style.display = 'block'
}

function onStopRecordClick () {
  document.querySelector('#startBtn').style.display = 'block'
  document.querySelector('#stopBtn').style.display = 'none'
}

function startVideo () {
  let constraints = { audio: true, video: { width: 400, height: 300 } }

  navigator.mediaDevices.getUserMedia(constraints)
    .then(function (mediaStream) {
      onStartRecordClick()
      let mediaRecorder = mediarecorder(mediaStream)
      initialiseSendVideoDisplay(mediaStream)
      window.stopVideo = function () {
        mediaRecorder.stop()
        mediaStream.getTracks().forEach((track) => {
          track.stop()
        })
        onStopRecordClick()
      }
    })
    .catch(function (err) { console.log(err.name + ': ' + err.message) })
}

function addToChatBox (data) {
  let li = document.createElement('li')
  li.appendChild(document.createTextNode(data.name + ' : ' + data.message))
  document.getElementById('RealTimeSpan').innerHTML = ''
  document.getElementById('ChatUlBox').appendChild(li)
  var objDiv = document.getElementById('ChatUlBox')
  objDiv.scrollTop = objDiv.scrollHeight
}

function notifyUser (data) {
  let notification = new Notification(data.name, {body: data.message})
}

Object.assign(window, {startChat, sendChat, realTimeTypingFeed, startVideo})
