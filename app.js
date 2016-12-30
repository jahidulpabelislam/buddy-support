var express = require("express"),
    app = express(),
    http = require("http").Server(app),
    io = require("socket.io")(http);

http.listen(9000);

app.use(express.static(__dirname + "/public"));

require('./server/routes')(app);

require('./server/chat')(io);