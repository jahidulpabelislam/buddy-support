//Get files for SSL certificate
const fs = require("fs"),
    privateKey = fs.readFileSync("certs/server.key", "utf8"),
    certificate = fs.readFileSync("certs/server.crt", "utf8"),
    credentials = {key: privateKey, cert: certificate},

    //Configures a HTTPS Server & launches
    express = require("express"),
    app = express(),
    https = require("https").Server(credentials, app),
    io = require("socket.io")(https);
https.listen(9000);
app.use(express.static(__dirname + "/public"));

//Gets the file which handles all the routes
require("./server/routes")(app);

//Gets the file which handles all the chat functionality
require("./server/chat")(io);