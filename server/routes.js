module.exports = function (app) {

    var bodyParser = require('body-parser');

    app.use(bodyParser.json());

    app.use(bodyParser.urlencoded({extended: true}));

    app.get("/", function (req, res) {
        res.sendFile("/home/ubuntu/buddy-support/public/view/chat.html");
    });

    app.get("/contact/", function (req, res) {
        res.sendFile("/home/ubuntu/buddy-support/public/view/contact.html");
    });

    app.post("/contact/", function (req, res) {
        require('./contactForm')(req, res);
    });
};
