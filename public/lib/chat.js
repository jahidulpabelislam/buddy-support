//Create a connection to server side's socket.io to listen for events and send events
var socket = io(),

    //Sets up variables for later use
    hidden,
    visibilityChange,
    userMatched = false,
    lastMessageDate,
    newMessages = 0,
    onPage = true,

    //Sets up the months to be used later
    months = {
        0: "January", 1: "February", 2: "March", 3: "April", 4: "May", 5: "June",
        6: "July", 7: "August", 8: "September", 9: "October", 10: "November", 11: "December"
    },

    //Sets up the days to be used later
    days = {0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday"},

    //Gets the date endings
    getDateEnding = function(date) {
        var j = date % 10,
            k = date % 100;

        if (j === 1 && k !== 11) {
            return date + "st";
        } else if (j === 2 && k !== 12) {
            return date + "nd";
        } else if (j === 3 && k !== 13) {
            return date + "rd";
        }

        return date + "th";
    },

    //Adds the date of the new message to the view
    addDate = function() {
        var dateText,
            newMessageDate = new Date();

        //Checks if message is sent on the same day as the last message
        if ((lastMessageDate === undefined) || !(lastMessageDate.getDate() === newMessageDate.getDate() && lastMessageDate.getMonth() === newMessageDate.getMonth()
            && lastMessageDate.getFullYear() === newMessageDate.getFullYear())) {

            dateText = days[newMessageDate.getDay()] + " " + getDateEnding(newMessageDate.getDate()) + " " + months[newMessageDate.getMonth()] + " " + newMessageDate.getFullYear();

            $("#messages").append($("<p>").addClass("date").append($("<p>").text(dateText)));
        }

        lastMessageDate = newMessageDate;
    },

    //Returns the time of the new message
    getTime = function(date) {
        var hour = date.getHours(),
            minute = date.getMinutes(),
            period = "AM";

        //If the time is past 1:00pm make it 12 hour format
        if (hour > 12) {
            hour -= 12;
        }

        //If the time is past 12:00pm make the period to PM
        if (hour >= 12) {
            period = "PM";
        }

        //If the minute is lower than 10 add the '0' before
        if (minute < 10) {
            minute = 0 + minute.toString();
        }

        return hour + ":" + minute + period;
    },

    //Set up the view to display feedback
    setUpFeedback = function() {
        $("#startContainer").show();
        $("#feedbackContainer").show();
        $("#feedbackContainer").toggleClass("panel-success", false);
        $("#chat").hide();
        $("#chatButtons").hide();
        $("#messageForm").hide();
        $("#notifications").children().hide();

        userMatched = false;
    },

    //Adds feedback to the view
    addFeedback = function(feedback) {
        $("#motivationalMessageContainer").hide();

        setUpFeedback();

        $("#feedbackContainer").toggleClass("panel-primary", true);

        var $button = $('<button/>').text('OK').addClass("btn btn-success").click(function() {
            $("#messagesContainer").hide();
            matchUser();
        });

        socket.emit("translate", feedback, function(error, translation) {
            if (!error && translation && translation.translatedText) {
                feedback = translation.translatedText;
            }

            $("#feedback").text(feedback).append($button);

            $("#notificationSound")[0].play();
        });
    },

    //Adds feedback to the view but as a smaller notification in chat
    addFeedbackInChat = function(feedback) {

        socket.emit("translate", feedback, function(error, translation) {
            if (!error && translation && translation.translatedText) {
                feedback = translation.translatedText;
            }

            //Create and add message and 'x' button
            $("#error").show();
            $("#error");

            var button = $("<button>").addClass("close").append($("<span>").text("×")).click(function() {
                $("#error").hide();
            });

            $("#error").text(feedback).append(button);
        });
    },

    //Sets up the view and variables for chat
    setUpChat = function() {
        $("#messages").empty();
        $("#chat").show();
        $("#messageForm").show();
        $("#chatButtons").show();
        $("#startContainer").hide();
        lastMessageDate = undefined;
        userMatched = true;

        sendNotification("Matched with a User.");

        //Add the display of whose side of who's
        $("#messages")
            .append($("<p>").attr("id", "userDisplay")
                .append($("<p>").text("↓ Matched User").addClass("matched"))
                .append($("<p>").text("You ↓").addClass("user")));
    },

    //Sends a request to try and get the user matched
    matchUser = function() {
        $("#motivationalMessageContainer").hide();
        $("#preferences").hide();
        $("#messagesContainer").show();

        $("#feedbackContainer").toggleClass("panel-success", true);

        var $button = $('<button/>').text('Back').addClass("btn btn-warning").click(function() {
            socket.emit("start again");
            $("#preferences").show();
            $("#messagesContainer").hide();
        });

        $("#feedback").text("Finding a match...").append($button);

        socket.emit("match", function(matched, feedback, waitingMessage, blocked) {

            userMatched = matched;

            if (matched) {
                setUpChat();
            } else if (waitingMessage) {
                $("#feedbackContainer").toggleClass("panel-primary", true);
                $("#feedbackContainer").toggleClass("panel-success", false);

                var $button = $('<button/>').text('Back').addClass("btn btn-warning").click(function() {
                    socket.emit("start again");
                    $("#preferences").show();
                    $("#messagesContainer").hide();
                });

                $("#feedback").text(feedback).append($button);

                $("#motivationalMessageContainer").show();
                $("#motivationalMessage").show();
                $("#motivationalMessage").text(waitingMessage);
            } else if (blocked) {
                blocked();
            }
        });

    },

    //Sends a request to skip the matched user
    skipUser = function() {
        if (userMatched) {
            socket.emit("skip", function(feedback) {
                addFeedback(feedback);
            });
        } else {
            addFeedbackInChat("You aren't matched with anyone.");
        }
    },

    //Sends a request to report the matched user
    reportUser = function() {
        if (userMatched) {
            socket.emit("report", function(feedback) {
                addFeedback(feedback);
            });
        } else {
            addFeedbackInChat("You aren't matched with anyone.");
        }
    },

    //Adds feedback to the view that the user is blocked from the application and chatting
    blocked = function() {
        setUpFeedback();
        $("#feedbackContainer").toggleClass("panel-danger", true);
        $("#feedbackContainer").toggleClass("panel-primary", false);

        var feedback = "You have been blocked.";
        socket.emit("translate", feedback, function(error, translation) {
            if (!error && translation && translation.translatedText) {
                feedback = translation.translatedText;
            }
        });

        $("#feedback").text(feedback);
        sendNotification(feedback);

        $("#motivationalMessageContainer").hide();
    },

    //Sends a notification via Notifications API and plays sound
    sendNotification = function(notification) {

        $("#notificationSound")[0].play();

        //If user isn't on page send notification
        if (!onPage && !currentlyViewing()) {

            socket.emit("translate", notification, function(error, translation) {
                if (!error && translation && translation.translatedText) {
                    notification = translation.translatedText;
                }

                //Checks if the browser supports notifications and whether  permissions has been granted already
                if ("Notification" in window && Notification.permission === "granted") {
                    //Sends notification
                    new Notification(notification);
                }

                //Otherwise sends request to the user to get permission
                else if (Notification.permission !== "denied") {
                    Notification.requestPermission(function(permission) {
                        //Sends notification if persmission was granted
                        if (permission === "granted") {
                            new Notification(notification);
                        }
                    });
                }
            });


        }
    },

    //Return whether user is on page/tab
    currentlyViewing = function() {
        return !document[hidden];
    },

    //Checks if the user has viewed the latest messages
    checkIfViewedMessages = function() {
        if ($(document).height() - $(document).scrollTop() === $(window).height()) {
            $("#newMessage").hide();
            socket.emit("viewed");
            newMessages = 0;
            document.title = "Chat | Buddy Support";
        }
    },

    //Adds 'No' button to confirmation message
    addNoButton = function() {
        return $('<button/>').text('No').addClass("btn btn-success").click(function() {
            $("#confirmationContainerContainer").css("z-index", "-1000");
            $("#confirmationContainerContainer").css("opacity", "0");
            $("#confirmationMessage").text("");
            $("#confirmationButtons").text("");
        });
    },

    //Displays confirmation message and get confirmation if they want to commit with action
    getConfirmation = function(actionString, actionEvent) {

        if (userMatched) {

            $("#confirmationContainerContainer").css("z-index", "2000");
            $("#confirmationContainerContainer").css("opacity", "100");

            var $no = addNoButton();

            var $yes = $('<button/>').text('Yes').addClass("btn btn-danger").click(function() {
                $("#confirmationContainerContainer").css("z-index", "-1000");
                $("#confirmationContainerContainer").css("opacity", "0");
                $("#confirmationMessage").text("");
                $("#confirmationButtons").text("");
                actionEvent();
            });

            var feedback = "Are you sure you want to " + actionString + " the user?";

            socket.emit("translate", feedback, function(error, translation) {
                if (!error && translation && translation.translatedText) {
                    feedback = translation.translatedText;
                }

                $("#confirmationMessage").text(feedback);

                $("#confirmationButtons").append($no).append($yes);

            });
        }
    },

    //Displays confirmation message to get confirmation if the user wants to leave the page
    getConfirmationToLeave = function(e) {

        $("#confirmationContainerContainer").css("z-index", "2000");
        $("#confirmationContainerContainer").css("opacity", "100");

        var $no = addNoButton();

        var $yes = $('<button/>').text('Yes').addClass("btn btn-danger").click(function() {
            window.location = e.href;
        });

        var feedback = "Are you sure you want to leave the chat?";

        socket.emit("translate", feedback, function(error, translation) {
            if (!error && translation && translation.translatedText) {
                feedback = translation.translatedText;
            }

            $("#confirmationMessage").text(feedback);
            $("#confirmationButtons").append($no).append($yes);
        });
        return false;
    };

/*
 Handlers user interface elements
 */

//On preferences change, it checks if the choice's are valid
$("#preferences").change(function() {
    var topics = [];

    $.each($("input[name='topic']:checked"), function() {
        topics.push($(this).val());
    });

    if (topics.length > 0 && ((topics.indexOf("Anything") !== -1 && topics.length === 1) || (topics.indexOf("Anything") === -1))) {
        $("#preferencesFeedbackContainer").hide();
    }
});

//On preferences submit check if the choice's are valid, if not provide feedback, if ok send to server
$("#preferences").submit(function(e) {

    var topics = [];

    $.each($("input[name='topic']:checked"), function() {
        topics.push($(this).val());
    });

    if (topics.length === 0) {
        $("#preferencesFeedbackContainer").show();
        $("#preferencesFeedback").text("Please select a topic.");
    } else if (topics.indexOf("Anything") !== -1 && topics.length > 1) {
        $("#preferencesFeedbackContainer").show();
        $("#preferencesFeedback").text("You can't select 'Anything' as a topic along with another topic.");
    } else {
        var data = {
            type: $("input[name='type']:checked").val(),
            topics: topics
        };

        socket.emit("preferences change", data, function(feedback) {
            if (feedback) {
                $("#preferencesFeedbackContainer").show();
                $("#preferencesFeedback").text(feedback);
            } else {
                $("#preferencesFeedbackContainer").hide();
                matchUser();
            }
        });
    }
    e.preventDefault();
});

//When user tries to send a message
$("#textSend").submit(function(e) {
    if (userMatched) {
        if ($("#message").val().trim() !== "") {
            socket.emit("send message", $("#message").val(), function(error) {
                if (error) {
                    addFeedbackInChat(error);
                } else {
                    addDate();
                    var $viewedTime = $("<span>").addClass("viewedTime"),
                        $deliveryReportImg = $("<span>").addClass("deliveryImg glyphicon glyphicon-ok-circle"),
                        $timeSent = $("<span>").addClass("time").text(getTime(lastMessageDate)),
                        $reports = $("<p>").append($timeSent).append($deliveryReportImg).append($viewedTime);

                    $("#messages").append($("<p>").addClass("sent").append($("<p>").text($("#message").val()).append($reports)));
                    $("#message").val("");
                    $("html, body").animate({scrollTop: $(document).height() - $(window).height()});
                }
            });
        } else {
            addFeedbackInChat("Message is empty, message can't be empty.");
        }
    } else {
        addFeedbackInChat("You aren't matched with anyone.");
    }
    e.preventDefault();
});

//When the user tries to skip the match user
$("#skipButton").click(function() {
    getConfirmation("skip", skipUser);
});

//When the user tries to report the match user
$("#reportButton").click(function() {
    getConfirmation("report", reportUser);
});

    /*
        Functions for the "user typing" feature
     */
    var typingTimeout,

        //Send event that user stopped typing
        typingTimeoutFunction = function() {
            socket.emit("typing", false);
        };

    $("#message").keyup(function(e) {

        $("#error").hide();

        clearTimeout(typingTimeout);

        //Get key code of key pressed
        var code = e.keyCode ? e.keyCode : e.which;

        //If 'Enter' wasn't pressed, send event that user is typing
        if (code !== 13) {
            socket.emit("typing", true);

            //Reset/Start timer
            typingTimeout = setTimeout(typingTimeoutFunction, 2000);
        }
        //Else user pressed 'Enter' so send event that user stopped typing
        else {
            socket.emit("typing", false);
        }
    });

//Send server update of new lanuage chosen
$("#language").change(function() {
    socket.emit("language change", $("#language").val());
});

//When user clicks the new message notification, scroll to the new message
$("#newMessage").click(function() {
    $("html, body").animate({scrollTop: $(document).height() - $(window).height()});
});

//Gets the type of hidden variable for the browser
if (typeof document.hidden !== "undefined") {
    hidden = "hidden";
    visibilityChange = "visibilitychange";
} else if (typeof document.msHidden !== "undefined") {
    hidden = "msHidden";
    visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
    hidden = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
}

//When the user comes on page it checks if they viewed the new messages (if any)
document.addEventListener(visibilityChange, function() {
    if (!document[hidden]) {
        checkIfViewedMessages();
    }
});

//When the user comes on page, change the variable to correspond and it checks if they viewed the new messages (if any)
$(window).focus(function() {
    onPage = true;
    checkIfViewedMessages();
});

//When the user goes off page, change the variable to correspond
$(window).blur(function() {
    onPage = false;
});

//When the user scrolls it checks if they viewed the new messages (if any)
$(window).scroll(function() {
    checkIfViewedMessages();
});

/*
 ---------------
 */


/*
 Handlers for events sent from server/socket.io
 */

//When the user has been matched
socket.on("matched", setUpChat);

//When the user has been unmatched
socket.on("unmatched", function() {
    $("#motivationalMessageContainer").hide();
    addFeedback("User has left the chat.");
    sendNotification("User has left the chat.");
});

//When the user receives a message from the matched user
socket.on("receive message", function(msg) {

    //Add the Date (If needed)
    addDate();

    //Get the time of the message
    var time = getTime(lastMessageDate),

        //Get whether the user user is at the bottom of the page
        atTheBottom = $(document).height() - $(document).scrollTop() === $(window).height();

    //Add the message
    $("#messages")
        .append($("<p>").addClass("received")
            .append($("<p>").text(msg)
                .append($("<p>").addClass("time").text(time))));

    //If the user is at the bottom of the page and currently on the page, scroll to the bottom, and emit that its viewed
    if (atTheBottom && onPage && currentlyViewing()) {
        $("html, body").animate({scrollTop: $(document).height() - $(window).height()});
        socket.emit("viewed");
    } else {
        newMessages++;

        var feedback = "(" + newMessages + ") New Message";
        socket.emit("translate", feedback, function(error, translation) {
            if (!error && translation && translation.translatedText) {
                feedback = translation.translatedText;
            }

            $("#newMessage").text(feedback);
            $("#newMessage").append($("<i>").addClass("fa fa-arrow-down"));
            $("#newMessage").show();
        });

        document.title = "(" + newMessages + ") Chat | Buddy Support";
    }

    sendNotification("User has messaged you.");
});

//When the server sends a
socket.on("blocked", function() {
    blocked();
});

//When the matched user has either started or stopped typing, so hide or show message accordingly
socket.on("typing", function(typing) {
    if (typing) {
        $("#userTyping").show();
    } else {
        $("#userTyping").hide();
    }
});

//When the matched user has viewed the messages update the message boxes
socket.on("viewed", function() {

    //Update deleviry report for the new viewed messages
    $(".deliveryImg.glyphicon-ok-circle").each(function() {
        //Update Icon
        $(this).toggleClass("glyphicon-ok-circle", false);
        $(this).toggleClass("glyphicon glyphicon-eye-open", true);

        //Add the time
        var time = getTime(new Date());
        $(this).parent().children(".viewedTime").text(time)
    });
});

/*
 ---------------
 */


//Get the list of available languages and append to drop down menu
socket.emit("get languages", function(languages) {
    languages.forEach(function(aLanguage) {
        $("#language").append($("<option>").val(aLanguage.language).text(aLanguage.name));
    });
    $("#language").val("en");
});