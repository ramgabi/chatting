const http = require('http');
const static = require('serve-static');
const express = require('express');
// important: this [cors] must come before Router
const cors = require('cors');
const router = express.Router();
const app = express();
var socketio = require('socket.io')
// const path = require('path');

// app.use('/', static(__dirname + '/html/'));
app.set('port', process.env.PORT || 3000);
app.use(cors());

app.get('/', function (req, res) {
    // res.sendFile(path.join(__dirname + '/html/chat.html'));
    res.sendFile(__dirname + '/html/signin.html');
})

// chat messages, log-in & out logs
// friend list, group list, room list
// person info (id,chat_room_id, room, group, level )


var profiles = {};
var rooms = {};
// var userGroups = {};
var messages = [];
var chatLogs = {};

router.route('/room/list').post((req, res) => {

    var authenticated = false;

    // later, need a fix to actually authenticate the user
    var userKey = req.body.ID;
    var user = {
        ID: req.body.ID,
        PW: req.body.PW,
        Nick: req.body.Nick
    }
    if (user.ID != null) {
        if (profiles.length == 0 || !profiles.includes(userKey)) profiles[userKey] = user;
        if (profiles.userKey.PW == user.PW) authenticated = true;
    }
    if (authenticated === true) res.redirect('/html/roomlist.html');
    else res.redirect('/html/signin.html');
});

router.route('/room/list').get((req, res) => {
    var group = req.query.group;
    var name = req.query.name;
    var level = req.query.level;
    users.push({ 'name': name, 'level': level, 'group': group });
    if (group in userGroups) {
        userGroups[group].push(name);
    } else {
        userGroups[group] = [name];
    }
});

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
console.log("socket.io ready...");