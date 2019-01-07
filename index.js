var app = require('express')();
var cors = require('cors');
var corsOptions = {
  origin: 'http://localhost:8080',
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors());
var http = require('http').Server(app);
//var redis = require('socket.io-redis');
var io = require('socket.io')(http, {path: '/ws'});
//io.adapter(redis({ host: 'localhost', port: 6379 }));
var port = process.env.PORT || 3000;

var users = {};
var chats = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
//  console.log(socket.handshake.query)
//  let { username } = socket.handshake.query;
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
  socket.on('join', function(msg) {
    console.log('join', msg);
    users[msg.username] = socket;
    socket.emit('join', chats);
    const joiner = {
      userId: msg.username,
      name: msg.username,
      avatar: 'https://ptetutorials.com/images/user-profile.png',
      lastChatDate: '',
      lastMessage: ''
    };
    if (!chats.some(el => el.userId === joiner.userId)) {
      chats.push(joiner);
    }
    io.emit('join', [joiner]);
  });
  socket.on('private', function(message) {
    console.log(message)
    users[message.toUserId].emit('private', message);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
