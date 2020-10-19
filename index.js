const http = require('http');
const static = require('serve-static');
const express = require('express');
const router = express.Router();
const app = express();
const path = require('path');
// const cors = require('cors');

app.use('/', static(__dirname + '/html/'));
app.set('port', process.env.PORT || 3000);
// app.use(cors());

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/html/chat.html'));
})

// chat messages, log-in & out logs
// friend list, group list, room list
// person info (id,chat_room_id, room, group, level )


var users = [];
var userGroups = {};
var messages = [];

router.route('/userRegister').get((req, res) => {
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

router.route('/send').get((req, res) => {
    // console.log(req.query.whisperTo);
    messages.push({ 'name': req.query.name, 'message': req.query.message, 'whisperTo': req.query.whisperTo });
    res.redirect('/chat.html');
});
router.route('/chatLogCheck/:sz/:name').get((req, res) => {
    var name = req.params.name;
    var sz = parseInt(req.params.sz);
    var l = messages.length;
    var data = '';
    if (l == 0 || l <= sz) res.end();
    else {
        var slicedMessages = messages.slice(sz);
        var filteredMessages = slicedMessages.filter(function (msg) {
            return (msg.whisperTo == '' || msg.whisperTo == name)
        })
        if (filteredMessages.length != 0) {
            data = {
                'size': l,
                'messages': filteredMessages,
            };
        }
        res.end(JSON.stringify(data));
    }
});


app.use('/', router);
const server = http.createServer(app);
server.listen(app.get('port'), () => {
    console.log('http://localhost:%d', app.get('port'));
});