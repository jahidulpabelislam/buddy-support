module.exports = function(io) {

    var users = {},
        isprofanity = require('isprofanity'),
        googleTranslate = require('google-translate')("AIzaSyD9-7x_akVND9A5sGSYNyHfpZ_BfIqPHnI");

    io.on("connection", function(socket) {

        if (!socket.username) {
            //allocate a random username
            var i = 0, userExists = true;
            while (userExists) {
                var username = i.toString();
                if (users[username] === undefined) {
                    users[username] = socket;
                    socket.username = username;
                    users[username].skipped = [];
                    users[username].reported = 0;
                    users[username].start = false;
                    users[username].topics = ["Anything"];
                    users[username].type = "Supporter";
                    users[username].language = "en";
                    userExists = false;
                } else i++;
            }
        }

        //match user with a random partner
        socket.on("match", function(callback) {
            var matched = false,
                feedback = "",
                blocked = false,
                waiting = false,
                waitingMessage = "";

            users[socket.username].start = true;

            //checks if user is already matched
            if (users[socket.username].partner === undefined) {

                //check is user has been blocked
                if (users[socket.username].reported <= 5) {

                    //loop through all user to find a match
                    for (var username in users) {

                        //check if looped user isn't the user, haven't skipped each other, isn't blocked, isn't matched, is opposite type of user (supporter & supportee)
                        if (username !== socket.username && users[socket.username].skipped.indexOf(username) === -1
                            && users[username].skipped.indexOf(socket.username) === -1 && users[username].partner === undefined
                            && users[username].reported <= 5 && users[username].start === true && users[username].type !== users[socket.username].type) {

                            //loop through all user to find a match
                            for (var topic in users[username].topics) {

                                if (users[socket.username].topics.indexOf(users[username].topics[topic]) !== -1) {

                                    users[username].partner = socket.username;
                                    users[socket.username].partner = username;
                                    users[username].emit("matched");
                                    matched = true;
                                    break;
                                }
                            }

                            if (matched) {
                                break;
                            }
                        }
                    }

                    if (!matched) {
                        waiting = true;
                        feedback = "No Users Available. Waiting for a match...";
                        waitingMessage = "Placeholder Motivational Message."
                    }

                } else {
                    blocked = true;
                    feedback = "You have been blocked from chatting.";
                }

            } else {
                matched = true;
                feedback = "Already matched.";
            }

            callback(matched, feedback, waitingMessage, blocked);
        });

        socket.on("send message", function(message, callback) {
            var error;
            if (message.trim() !== "") {
                var partner = users[socket.username].partner;
                if (partner) {
                    isprofanity(message, function(profanity) {
                        //checks if message doesn't include any profanity
                        if (!profanity) {
                            googleTranslate.translate(message, users[partner].language, function(err, translation) {
                                if (err) {
                                    error = err;
                                } else {
                                    users[partner].emit("receive message", translation.translatedText);
                                }
                            });
                        }
                        else {
                            error = "Message contains profanity.";
                        }
                        callback(error);
                    });
                } else {
                    error = "You aren't matched with anyone.";
                    callback(error);
                }
            } else {
                callback(error);
            }
        });

        socket.on("disconnect", function() {
            if (!socket.username) return;
            var partner = users[socket.username].partner;
            if (partner) {
                delete users[partner].partner;
                users[partner].start = false;
                users[partner].emit("unmatched");
            }
            delete users[socket.username];
        });

        socket.on("skip", function(callback) {
            var partner = users[socket.username].partner,
                feedback;
            if (partner) {
                delete users[partner].partner;
                delete users[socket.username].partner;
                users[socket.username].skipped.push(partner);
                users[partner].emit("unmatched");
                users[partner].start = false;
                users[socket.username].start = false;
                feedback = "User has been skipped.";
            } else {
                feedback = "You aren't matched with anyone.";
            }

            callback(feedback);
        });

        socket.on("report", function(callback) {
            var partner = users[socket.username].partner,
                feedback;
            if (partner) {
                delete users[partner].partner;
                delete users[socket.username].partner;
                users[socket.username].skipped.push(partner);
                users[partner].reported++;
                users[partner].start = false;
                users[socket.username].start = false;
                if (users[partner].reported > 5) {
                    users[partner].emit("blocked");
                } else {
                    users[partner].emit("unmatched");
                }
                feedback = "User has been reported.";
            } else {
                feedback = "You aren't matched with anyone.";
            }

            callback(feedback);
        });

        socket.on("change preferences", function(data) {
            if (!socket.username) return;

            if (data.type === "Supporter") {
                users[socket.username].type = "Supporter";
            } else if (data.type === "Supportee") {
                users[socket.username].type = "Supportee";
            }

            users[socket.username].topics = data.topics;

        });

        socket.on("start again", function() {
            if (!socket.username) return;

            users[socket.username].start = false;

        });

        socket.on("typing", function(typing) {
            if (!socket.username) return;

            var partner = users[socket.username].partner;

            if (partner) {
                users[partner].emit("typing", typing);
            }
        });

        socket.on("get languages", function(callback) {
            if (!socket.username) return;

            googleTranslate.getSupportedLanguages(users[socket.username].language, function(err, languageCodes) {
                callback(languageCodes);
            });
        });

        socket.on("change language", function(language, callback) {
            if (!socket.username) return;

            users[socket.username].language = language;

            googleTranslate.getSupportedLanguages(users[socket.username].language, function(err, languageCodes) {
                callback(languageCodes);
            });
        });

    });
};
