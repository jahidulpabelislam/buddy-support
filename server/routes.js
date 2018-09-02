//Code which handles all the routes
module.exports = function(app) {
    "use strict";

    //use body-parser as middle-ware layer to handle POST request and its data from the request
    const bodyParser = require('body-parser');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    //when the user requests home/chat page
    app.get("/", function(req, res) {
        //send the chat page back and display it
        res.sendFile("/Users/Pabel/Google-Drive/Project/Buddy-Support/public/view/chat.html");
    });

    //when the user requests the contact page
    app.get("/contact/", function(req, res) {
        //send the contact page back and display it
        res.sendFile("/Users/Pabel/Google-Drive/Project/Buddy-Support/public/view/contact.html");
    });

    //when the user requests to send a message from contact page
    app.post("/contact/", function(req, res) {
        //get the contactForm code which handles the request
        require('./contactForm')(req, res);
    });

    //when the user requests the help page
    app.get("/help/", function(req, res) {
        //send the help page back and display it
        res.sendFile("/Users/Pabel/Google-Drive/Project/Buddy-Support/public/view/help.html");
    });
};
