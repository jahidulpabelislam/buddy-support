//Code that handles chat events/Socket.io events
module.exports = function(io) {

    //Used to store a list of the current users
    var users = {},

        //Gets the External packages needed for the chat functionanlity
        isprofanity = require('isprofanity'),
        googleTranslate = require('google-translate')("AIzaSyD9-7x_akVND9A5sGSYNyHfpZ_BfIqPHnI"),
        randomstring = require("randomstring"),

        //Holds the motivational messages for each type of user for use later
        motivationalMessages = {
            Supportee: [
                "I know how you are feeling.",
                "You can do this.",
                "Everyone goes through experiences like this.",
                "Take a deep breath.",
                "It will get easier.",
                "You can only do your best.",
                "Keep smiling.",
                "Don't give up.",
                "Don't worry, you can do this.",
                "Everyone is different.",
                "I know you will succeed.",
                "I am proud of you.",
                "Be very proud of yourself.",
                "Keep going.",
                "You're very patient.",
                "You are awesome."
            ],
            Supporter: [
                "I am proud of you.",
                "Be very proud of yourself.",
                "You're very patient.",
                "You are awesome.",
                "Buddy Support is grateful to you.",
                "Supportees are grateful to you.",
                "Buddy Support couldn't make do without you.",
                "Supportees couldn't make do without you.",
                "I'm really glad you are here for Supportees.",
                "Your work is very appreciated.",
                "I'm really glad you are here for Supportees.",
                "Supportees appreciates you.",
                "Buddy Support appreciates you.",
                "Buddy Support is really lucky to have you.",
                "Supportees are really lucky to have you."
            ]
        };

    //Holds all the Events to listen to After a User has connected to the chat
    io.on("connection", function(socket) {

        //Allocates a random username on connection
        if (!socket.username) {
            var usernameAllocated = false;
            while (!usernameAllocated) {
                var username = randomstring.generate();
                if (users[username] === undefined) {
                    users[username] = socket;
                    socket.username = username;
                    users[username].skipped = [];
                    users[username].reported = 0;
                    users[username].start = false;
                    users[username].topics = ["Anything"];
                    users[username].type = "Supporter";
                    users[username].language = "en";
                    usernameAllocated = true;
                }
            }
        }

        //Matches user with a random partner
        socket.on("match", function(callback) {
            var matched = false,
                feedback = "",
                blocked = false,
                randomMotivationalMessage = "";

            users[socket.username].start = true;

            //Checks if the user is already matched
            if (users[socket.username].partner === undefined) {

                //Checks if the user has been blocked
                if (users[socket.username].reported <= 5) {

                    //Loops through all users to find a match
                    for (var username in users) {

                        //Checks if the looped user isn't the user, haven't skipped each other, isn't blocked, isn't matched, is opposite type of user (supporter & supportee)
                        if (username !== socket.username && users[socket.username].skipped.indexOf(username) === -1
                            && users[username].skipped.indexOf(socket.username) === -1 && users[username].partner === undefined
                            && users[username].reported <= 5 && users[username].start === true && users[username].type !== users[socket.username].type) {

                            //Loops through the looped user's topic to find a match with the same topic
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

                    //Checks if no match was found, try to find a match that has a topic of anything
                    if (!matched) {

                        //Loops through all users
                        for (var username in users) {

                            //Checks if the looped user isn't the user, haven't skipped each other, isn't blocked, isn't matched, is opposite type of user (supporter & supportee)
                            if (username !== socket.username && users[socket.username].skipped.indexOf(username) === -1
                                && users[username].skipped.indexOf(socket.username) === -1 && users[username].partner === undefined
                                && users[username].reported <= 5 && users[username].start === true && users[username].type !== users[socket.username].type) {

                                //Checks if either has a topic of 'Anything'
                                if (users[socket.username].topics.indexOf("Anything") !== -1 || users[username].topics.indexOf("Anything") !== -1) {

                                    users[username].partner = socket.username;
                                    users[socket.username].partner = username;
                                    users[username].emit("matched");
                                    matched = true;
                                    break;
                                }

                                if (matched) {
                                    break;
                                }
                            }
                        }

                        //If still not match send out feedback and motivataional message
                        if (!matched) {
                            feedback = "No Users Available. Waiting for a match...";
                            var messageIndex = Math.floor(Math.random() * motivationalMessages[users[socket.username].type].length);
                            randomMotivationalMessage = motivationalMessages[users[socket.username].type][messageIndex];
                        }
                    }

                }
                //Else send feedback that they are blocked from the app
                else {
                    blocked = true;
                }
            }
            //Else send feedback that they already have a match
            else {
                matched = true;
            }

            //Translate the feedback and send it back to user
            googleTranslate.translate(feedback, users[socket.username].language, function(err, translation) {

                googleTranslate.translate(randomMotivationalMessage, users[socket.username].language, function(err2, translation2) {

                    callback(matched, translation.translatedText || feedback, translation2.translatedText || randomMotivationalMessage, blocked);
                });

            });

        });

        //Sends a message a user has sent to their partner
        socket.on("send message", function(message, callback) {
            var error;

            //Check if the message isn't empty
            if (message.trim() !== "") {

                //Check if partner exists
                var partner = users[socket.username].partner;
                if (partner) {

                    isprofanity(message, function(profanity) {

                        //Checks if the message doesn't include any profanity
                        if (!profanity) {

                            googleTranslate.translate(message, users[partner].language, function(err, messageTranslation) {
                                callback(error);
                                users[partner].emit("receive message", messageTranslation.translatedText || message);
                            });
                        } else {
                            error = "Message contains profanity.";

                            googleTranslate.translate(error, users[socket.username].language, function(err, errorTranslation) {
                                callback(errorTranslation.translatedText || error);
                            });

                        }
                    });
                } else {
                    error = "You aren't matched with anyone.";

                    googleTranslate.translate(error, users[socket.username].language, function(err, translation) {
                        callback(translation.translatedText || error);
                    });
                }
            } else {
                error = "Message is empty, message can't be empty.";

                googleTranslate.translate(error, users[socket.username].language, function(err, translation) {
                    callback(translation.translatedText || error);
                });
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

            //Loops through all user to delete all users records
            for (var username in users) {

                //Checks if looped user isn't the user, haven't skipped each other, isn't blocked, isn't matched, is opposite type of user (supporter & supportee)
                if (users[username].skipped.indexOf(socket.username) !== -1) {
                    delete users[username].skipped[users[username].skipped.indexOf(socket.username)];
                }
            }

            //Deletes the user from the list of users
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

            googleTranslate.translate(feedback, users[socket.username].language, function(err, translation) {
                callback(translation.translatedText || feedback);
            });

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

            googleTranslate.translate(feedback, users[socket.username].language, function(err, translation) {
                callback(translation.translatedText || feedback);
            });

        });

        //Updates the new preferences
        socket.on("preferences change", function(data, callback) {
            if (!socket.username) return;

            var feedback;

            if (data.topics.length === 0) {
                feedback = "Please select a topic.";
            } else if (data.topics.indexOf("Anything") !== -1 && data.topics.length > 1) {
                feedback = "You can't select 'Anything' as a topic along with another topic.";
            } else {
                users[socket.username].topics = data.topics;
            }

            if (data.type === "Supporter") {
                users[socket.username].type = "Supporter";
            } else if (data.type === "Supportee") {
                users[socket.username].type = "Supportee";
            } else {
                feedback = "Please select your type, Supporter or a Supportee.";
            }

            callback(feedback)

        });

        //Stops matching
        socket.on("start again", function() {
            if (!socket.username) return;

            users[socket.username].start = false;
        });

        //Update the matched user whether or not they are currently typing
        socket.on("typing", function(typing) {
            if (!socket.username) return;

            var partner = users[socket.username].partner;
            if (partner) {
                users[partner].emit("typing", typing);
            }
        });

        //Gets the list of available languages and send it to the user
        socket.on("get languages", function(callback) {
            if (!socket.username) return;

            googleTranslate.getSupportedLanguages(users[socket.username].language, function(err, languages) {
                callback(languages);
            });
        });

        //Changes the language when user has selected another
        socket.on("language change", function(language) {
            if (!socket.username) return;

            users[socket.username].language = language;
        });

        //Translates a string
        socket.on("translate", function(string, callback) {
            //If user hasn't got a username, just return
            if (!socket.username) return;

            //Translate the string and send back
            googleTranslate.translate(string, users[socket.username].language, function(err, translation) {
                callback(err, translation);
            });
        });

        //When the user has viewed the messages
        socket.on("viewed", function() {

            //If user hasn't got a username, just return
            if (!socket.username) return;

            //Check user has a partner, and then let them know messages are viewed
            var partner = users[socket.username].partner;
            if (partner) {
                users[partner].emit("viewed");
            }
        });

    });
};
