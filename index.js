var app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    users = {};

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    var i = 0, userExists = true;
    while (userExists) {
        if (users[i.toString()] === undefined) {
            users[i.toString()] = socket;
            socket.username = i.toString();
            userExists = false;
        }
        i++;
    }

    socket.on('send message', function (msg) {
        io.emit('receive message', msg);
    });

    socket.on("disconnect", function () {
        if (!socket.username) return;
        delete users[socket.username];
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});