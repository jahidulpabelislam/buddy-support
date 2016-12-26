var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    users = {};

app.use(express.static(__dirname + '/public/lib'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/view/index.html');
});

io.on('connection', function (socket) {
    //allocate a random username
    var i = 0, userExists = true;
    while (userExists) {
        var newUsername = i.toString();
        if (users[newUsername] === undefined) {
            users[newUsername] = socket;
            socket.username = newUsername;
            userExists = false;

            //allocate a random partner
            for (var username in users) {
                if (username !== socket.username && users[username]["partner"] === undefined) {
                    users[username]["partner"] = socket.username;
                    users[socket.username]["partner"] = username;
                    break;
                }
            }
        }
        i++;
    }

    socket.on('send message', function (msg) {
        if (msg.trim() !== "") {
            var partner = users[socket.username]["partner"];
            if (partner) {
                users[partner].emit('receive message', msg);
            }
        }
    });

    socket.on("disconnect", function () {
        if (!socket.username) return;
        var partnerUsername = users[socket.username]["partner"];
        if (partnerUsername) {
            delete users[partnerUsername]["partner"];
        }
        delete users[socket.username];
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});