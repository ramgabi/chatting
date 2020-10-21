const url = require('url');
const http = require('http');
const static = require('serve-static');
const express = require('express');
const bodyParser = require('body-parser')
// important: this [cors] must come before Router
const cors = require('cors');
const router = express.Router();
const app = express();
var socketio = require('socket.io')
// const path = require('path');

// app.use('/', static(__dirname + '/html/'));
app.use('/', static(__dirname + '/html'));
app.set('port', process.env.PORT || 3000);
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json())

app.get('/', function (req, res) {
    // res.sendFile(path.join(__dirname + '/html/chat.html'));
    res.sendFile(__dirname + '/html/signin.html');
})

// chat messages, log-in & out logs
// friend list, group list, room list
// person info (id,chat_room_id, room, group, level )


var profiles = {};
var rooms = [
    {
        roomID: 1,
        roomPW: null,
        roomTitle: '조용한 방',
        roomCapacity: 8,
        roomOwner: '홍길동'
    },
    {
        roomID: 2,
        roomPW: null,
        roomTitle: '시끄러운 방',
        roomCapacity: 20,
        roomOwner: '시끌이'
    },
    {
        roomID: 3,
        roomPW: null,
        roomTitle: '말많은 방',
        roomCapacity: 5,
        roomOwner: '수다쟁이'
    }
]

var chatLogs = {};
var messages = [];

router.route('/profile/signin').post((req, res) => {

    var authenticated = false;

    // later, need a fix to actually authenticate the user
    var userKey = req.body.pID;
    // var user = {
    //     pID: req.body.pID,
    //     pPW: req.body.pPW,
    //     pNick: req.body.pNick
    // }
    var user = req.body;
    if (user.pID != null) {
        if (profiles.length == 0 || !profiles.hasOwnProperty(userKey)) {
            user.pGroup = null;
            user.pRoomID = null;
            profiles[userKey] = user;
        }
        // console.log('profiles', profiles)
        // dot뒤의 문자는 문자열로 받아들여진다(변수명 사용불가)
        if (profiles[userKey].pPW == user.pPW) authenticated = true;
    }
    if (authenticated === true) {
        res.redirect(url.format({
            pathname: '/roomlist.html',
            query: user
        }))
    }
    else res.redirect('/signin.html');
});

router.route('/room/list').get((req, res) => {
    res.end(JSON.stringify({ rooms: rooms }));
});

router.route('/room/join/:roomID/:pID').get((req, res) => {
    var selectedRoomID = req.params.roomID;
    var pID = req.params.pID;

    // personal socket
    // 접속하는 순간부터 소켓으로 모든 이벤트 관리해야할듯...?

    res.redirect('/chat.html');
})

// router.route('')

// router.route('/send').get((req, res) => {
//     // console.log(req.query.whisperTo);
//     messages.push({ 'name': req.query.name, 'message': req.query.message, 'whisperTo': req.query.whisperTo });
//     // res.redirect('/chat.html');
// });
// router.route('/chatLogCheck/:sz/:name').get((req, res) => {
//     var name = req.params.name;
//     var sz = parseInt(req.params.sz);
//     var l = messages.length;
//     var data = '';
//     if (l == 0 || l <= sz) res.end();
//     else {
//         var slicedMessages = messages.slice(sz);
//         var filteredMessages = slicedMessages.filter(function (msg) {
//             return (msg.whisperTo == '' || msg.whisperTo == name)
//         })
//         if (filteredMessages.length != 0) {
//             data = {
//                 'size': l,
//                 'messages': filteredMessages,
//             };
//         }
//         res.end(JSON.stringify(data));
//     }
// });


app.use('/', router);
const server = http.createServer(app);
server.listen(app.get('port'), () => {
    console.log('http://localhost:%d', app.get('port'));

    // database.init(app,config);
});
var io = socketio.listen(server);
io.on('connection', (socket) => {
    // console.log('a user connected');
    io.emit('enter');
    // console.log('socket: ', socket);
    socket.on('chat', (msg) => {
        messages.push({ 'name': msg.name, 'message': msg.txt });
        console.log(messages)
        io.emit('chat', msg);
    })
    socket.on('disconnect', () => {
        console.log('this user disconnected');
        io.emit('leave');
    })
})