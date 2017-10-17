import io from 'socket.io-client'
let socket = io()

Notification.requestPermission().then(() => {
  console.log(Notification.permission)
})

function startChat () {
  localStorage.setItem('GigglerName', document.getElementById('GigglerName').value)

  window.location.href = 'gigglePage.html'
}

function sendChat () {
  sendMessageToServer(document.getElementById('giggleText').value)
}

function sendMessageToServer (text) {
  document.getElementById('giggleText').value = ''
  socket.emit('SendingMessage', {message: text, name: localStorage.getItem('GigglerName')})
}

function realTimeTypingFeed () {
  socket.emit('Realtime feeding', {message: document.getElementById('giggleText').value, name: localStorage.getItem('GigglerName')})
}

socket.on('Realtime type feedback', function (data) {
  addToRealtimeLi(data.data)
})

socket.on('Message from server', function (data) {
  if (data.data.name !== localStorage.getItem('GigglerName')) {
    notifyUser(data.data)
  }
  addToChatBox(data.data)
})

function addToRealtimeLi (data) {
  let span = document.getElementById('RealTimeSpan')
  span.innerHTML = data.name + 'is typing : ' + data.message
}

function addToChatBox (data) {
  let li = document.createElement('li')
  li.appendChild(document.createTextNode(data.name + ' : ' + data.message))
  document.getElementById('RealTimeSpan').innerHTML = ''
  document.getElementById('ChatUlBox').appendChild(li)
}

function notifyUser (data) {
  let notification = new Notification(data.name, {body: data.message})
}

Object.assign(window, {startChat, sendChat, realTimeTypingFeed})
