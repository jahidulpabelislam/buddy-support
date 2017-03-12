var socket = io(),
    userMatched = false,
    lastMessageDate,
    newMessages = 0,

    //function that date to the chat box
    addDate = function() {
        var dateText,
            thisMessageDate = new Date();

        //checks if message is sent on the same day as the last message
        if ((lastMessageDate === undefined) || !(lastMessageDate.getDate() === thisMessageDate.getDate() && lastMessageDate.getMonth() === thisMessageDate.getMonth()
            && lastMessageDate.getFullYear() === thisMessageDate.getFullYear())) {

            dateText = days[thisMessageDate.getDay()] + " " + getDateEnding(thisMessageDate.getDate()) + " " + months[thisMessageDate.getMonth()] + " " + thisMessageDate.getFullYear();

            $("#messages").append($("<p>").addClass("date").append($("<p>").text(dateText)));
        }

        lastMessageDate = thisMessageDate;
    },

    //function to return the time of a message
    addTime = function() {
        var hour = lastMessageDate.getHours(),

            minute = lastMessageDate.getMinutes(),

            period = "AM";

        //if the time is past 1:00pm make the period to PM and make it 12 hour format
        if (hour > 12) {
            hour -= 12;
            period = "PM";
        }

        if (minute < 10) {
            minute = 0 + minute.toString();
        }

        return hour + ":" + minute + period;

    },

    setUpFeedback = function() {
        $("#startContainer").show();

        $("#chat").hide();
        $("#chatButtons").hide();
        $("#messageForm").hide();

        $("#feedbackContainer").show();

        $("#feedbackContainer").toggleClass("panel-success", false);

        userMatched = false;

        $("#notifications").children().hide();

    },

    addFeedback = function(feedback) {
        setUpFeedback();

        $("#feedbackContainer").toggleClass("panel-primary", true);

        $button = $('<button/>').text('OK').addClass("btn btn-success").click(function() {
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

    addFeedbackInChat = function(feedback) {

        socket.emit("translate", feedback, function(error, translation) {
            if (!error && translation && translation.translatedText) {
                feedback = translation.translatedText;
            }

            $("#error").show();
            $("#error").text(feedback);

            $closeButton = $("<button>").addClass("close").append($("<span>").text("×"));

            $("#error").append($closeButton);

            $closeButton.click(function() {
                $("#error").text("");
                $("#error").hide();
            });

        });

    },

    setUpChat = function() {
        $("#messages").empty();
        $("#chat").show();
        $("#messageForm").show();
        $("#chatButtons").show();
        $("#startContainer").hide();
        $("#motivationalMessage").hide();
        userMatched = true;

        sendNotifications("Matched with a User.");

        lastMessageDate = undefined;

        $("#messages").append($("<p>").attr("id", "userDisplay").append($("<p>").text("↓ Matched User").addClass("matched")).append($("<p>").text("You ↓").addClass("user")));
    },

    matchUser = function(e) {

        $("#preferences").hide();
        $("#messagesContainer").show();

        $("#feedbackContainer").toggleClass("panel-success", true);

        $("#feedback").text("Finding a match...");

        socket.emit("match", function(matched, feedback, waitingMessage, blocked) {

            userMatched = matched;

            if (matched) {
                setUpChat();
            } else if (waitingMessage) {

                $("#feedbackContainer").toggleClass("panel-primary", true);
                $("#feedbackContainer").toggleClass("panel-success", false);

                $button = $('<button/>').text('Back').addClass("btn btn-warning").click(function() {
                    socket.emit("start again");
                    $("#preferences").show();
                    $("#messagesContainer").hide();
                });

                $("#feedback").text(feedback).append($button);

                $("#motivationalMessage").show();
                $("#motivationalMessage").text(waitingMessage);

            } else if (blocked) {
                blocked();
            }
        });

        e.preventDefault();
    },

    sendMessage = function(e) {
        if (userMatched) {
            if ($("#message").val().trim() !== "") {
                socket.emit("send message", $("#message").val(), function(error) {
                    if (error) {
                        addFeedbackInChat(error);
                    } else {
                        addDate();
                        $("#messages").append($("<p>").addClass("sent").append($("<p>").text($("#message").val()).append($("<p>").addClass("time").text(addTime()).append($("<span>").addClass("delivery glyphicon glyphicon-ok-circle")))));
                        $("#message").val("");
                        $("html, body").animate({scrollTop: $(document).height() - $(window).height()});
                    }
                });
            }
        } else {
            addFeedbackInChat("You aren't matched with anyone.");
        }
        e.preventDefault();
    },

    skipUser = function() {
        if (userMatched) {
            socket.emit("skip", function(feedback) {
                addFeedback(feedback);
            });
        } else {
            addFeedbackInChat("You aren't matched with anyone.");
        }
    },

    reportUser = function() {
        if (userMatched) {
            socket.emit("report", function(feedback) {
                addFeedback(feedback);
            });
        } else {
            addFeedbackInChat("You aren't matched with anyone.");
        }
    },

    blocked = function() {
        setUpFeedback();

        $("#feedbackContainer").toggleClass("panel-danger", true);
        $("#feedbackContainer").toggleClass("panel-primary", false);

        $("#feedback").text("You have been blocked.");

        sendNotifications("You have been blocked.");

    },

    sendNotifications = function(notification) {

        $("#notificationSound")[0].play();

        if (!currentlyViewing()) {

            //check if the browser supports notifications and whether  permissions has been granted already
            if (("Notification" in window) && Notification.permission === "granted") {
                //send notification
                new Notification(notification);
            }

            //otherwise send request to the user for permission
            else if (Notification.permission !== "denied") {
                Notification.requestPermission(function(permission) {
                    //send notification
                    if (permission === "granted") {
                        new Notification(notification);
                    }
                });
            }

        }

    };

$("#preferences").submit(matchUser);

socket.on("matched", setUpChat);

socket.on("unmatched", function() {
    addFeedback("User has left the chat.");
    sendNotifications("User has left the chat.");
});

$("#textSend").submit(sendMessage);

socket.on("receive message", function(msg) {

    addDate();

    var time = addTime();

    var atTheBottom = $(document).height() - $(document).scrollTop() == $(window).height();

    $("#messages").append($("<p>").addClass("received").append($("<p>").text(msg).append($("<p>").addClass("time").text(time))));

    if (atTheBottom) {
        $("html, body").animate({scrollTop: $(document).height() - $(window).height()});
        if (currentlyViewing()) {
            socket.emit("viewed");
        }
    } else {
        newMessages++;
        $("#newMessage").text("(" + newMessages + ") New Message");
        $("#newMessage").append($("<i>").addClass("fa fa-arrow-down"));
        document.title = "(" + newMessages + ") Chat | Buddy Support";
        $("#newMessage").show();
    }

    sendNotifications("User has messaged you.");
});

$("#skipButton").click(function() {

    if (userMatched) {

        $("#confirmationContainerContainer").css("z-index", "2000");
        $("#confirmationContainerContainer").css("opacity", "100");

        $no = $('<button/>').text('No').addClass("btn btn-success").click(function() {
            $("#confirmationContainerContainer").css("z-index", "-1000");
            $("#confirmationContainerContainer").css("opacity", "0");
            $("#confirmationMessage").text("");
            $("#confirmationButtons").text("");
        });

        $yes = $('<button/>').text('Yes').addClass("btn btn-danger").click(function() {
            $("#confirmationContainerContainer").css("z-index", "-1000");
            $("#confirmationContainerContainer").css("opacity", "0");
            $("#confirmationMessage").text("");
            $("#confirmationButtons").text("");
            skipUser();
        });

        socket.emit("translate", "Are you sure you want to skip the user?", function(error, translation) {
            if (!error && translation && translation.translatedText) {
                feedback = translation.translatedText;
            }

            $("#confirmationMessage").text(feedback);

            $("#confirmationButtons").append($no).append($yes);

        });
    }

});

$("#reportButton").click(function() {
    if (userMatched) {

        $("#confirmationContainerContainer").css("z-index", "2000");
        $("#confirmationContainerContainer").css("opacity", "100");

        $no = $('<button/>').text('No').addClass("btn btn-success").click(function() {
            $("#confirmationContainerContainer").css("z-index", "-1000");
            $("#confirmationContainerContainer").css("opacity", "0");
            $("#confirmationMessage").text("");
            $("#confirmationButtons").text("");
        });

        $yes = $('<button/>').text('Yes').addClass("btn btn-danger").click(function() {
            $("#confirmationContainerContainer").css("z-index", "-1000");
            $("#confirmationContainerContainer").css("opacity", "0");
            $("#confirmationMessage").text("");
            $("#confirmationButtons").text("");
            reportUser();
        });

        socket.emit("translate", "Are you sure you want to report the user?", function(error, translation) {
            if (!error && translation && translation.translatedText) {
                feedback = translation.translatedText;
            }

            $("#confirmationMessage").text(feedback);

            $("#confirmationButtons").append($no).append($yes);

        });
    }
});

socket.on("blocked", function() {
    blocked();
});

$("#preferences").change(function() {
    var topics = [];
    $.each($("input[name='topic']:checked"), function() {
        topics.push($(this).val());
    });

    var data = {
        type: $("input[name='type']:checked").val(),
        topics: topics
    };

    socket.emit("change preferences", data);
});

var typingTimeout,

    typingTimeoutFunction = function() {
        socket.emit("typing", false);
    };

$("#message").keyup(function(e) {
    $("#error").hide();
    clearTimeout(typingTimeout);
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code !== 13) {
        socket.emit("typing", true);
        typingTimeout = setTimeout(typingTimeoutFunction, 2000);
    } else {
        socket.emit("typing", false);
    }
});

socket.on("typing", function(typing) {
    if (typing) {
        $("#userTyping").show();
    } else {
        $("#userTyping").hide();
    }
});

$(window).scroll(function() {
    if ($(document).height() - $(document).scrollTop() == $(window).height()) {
        $("#newMessage").hide();
        socket.emit("viewed");
        newMessages = 0;
        document.title = "Chat | Buddy Support";
    }
});

socket.emit("get languages", function(languageCodes) {
    languageCodes.forEach(function(aLanguage) {
        $("#language").append($("<option>").val(aLanguage.language).text(aLanguage.name));
    });
    $("#language").val("en");
});

$("#language").change(function() {

    socket.emit("change language", $("#language").val());

});

$("#newMessage").click(function() {
    $("html, body").animate({scrollTop: $(document).height() - $(window).height()});
});

var getConfirmation = function(e) {

    if (userMatched) {

        $("#confirmationContainerContainer").css("z-index", "2000");
        $("#confirmationContainerContainer").css("opacity", "100");

        $no = $('<button/>').text('No').addClass("btn btn-success").click(function() {
            $("#confirmationContainerContainer").css("z-index", "-1000");
            $("#confirmationContainerContainer").css("opacity", "0");
            $("#confirmationMessage").text("");
            $("#confirmationButtons").text("");
        });

        $yes = $('<button/>').text('Yes').addClass("btn btn-danger").click(function() {
            window.location = e.href;
        });

        socket.emit("translate", "Are you sure you want to leave the chat?", function(error, translation) {
            if (!error && translation && translation.translatedText) {
                feedback = translation.translatedText;
            }

            $("#confirmationMessage").text(feedback);

            $("#confirmationButtons").append($no).append($yes);

        });

        return false;
    } else {
        return true;
    }

};

socket.on("viewed", function() {

    $(".delivery").toggleClass("glyphicon-ok-circle", true);

    $(".delivery").toggleClass("glyphicon glyphicon-eye-open", true);

});