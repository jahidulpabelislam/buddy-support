var socket = io(),
    userMatched = false,

    lastMessageDate,

    //function that date to the chat box
    addDate = function() {
        var dateText,
            thisMessageDate = new Date();

        //checks if message is sent on the same day as the last message
        if ((lastMessageDate === undefined) || (lastMessageDate.getDate() !== thisMessageDate.getDate() && lastMessageDate.getMonth() !== thisMessageDate.getMonth()
            && lastMessageDate.getFullYear() !== thisMessageDate.getFullYear())) {
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

        if (hour > 12) {
            hour -= 12;
            period = "PM";
        }

        if (minute < 10) {
            minute = 0 + minute.toString();
        }

        return hour + ":" + minute + period;

    },

    setUpFeedback = function(feedback) {
        $("#startContainer").show();
        $("#chat").hide();
        $("#chatButtons").hide();
        $("#messageForm").hide();
        $("#feedbackContainer").show();
        $("#feedbackContainer").toggleClass("panel-primary", true);
        $("#feedbackContainer").toggleClass("panel-success", false);
        $button = $('<button/>').text('OK').addClass("btn btn-success").click(function() {
            $("#preferences").show();
            $("#messagesContainer").hide();
        });

        $("#feedback").text(feedback).append($button);
        $("#notificationSound")[0].play();
        userMatched = false;
    },

    setUpChat = function() {
        $("#messages").empty();
        $("#chat").show();
        $("#messageForm").show();
        $("#chatButtons").show();
        $("#startContainer").hide();
        $("#motivationalMessage").hide();
        userMatched = true;
        $("#notificationSound")[0].play();
        sendNotifications("Matched with a User.");
        lastMessageDate = undefined;
        $("#messages").append($("<p>").attr("id", "userDisplay").append($("<p>").text("↓ Matched User").addClass("matched")).append($("<p>").text("You ↓").addClass("user")));
    },

    addFeedbackInChat = function(feedback) {
        $("#error").show();
        $("#error").text(feedback);

        $closeButton = $("<button>").addClass("close").append($("<span>").text("×"));

        $("#error").append($closeButton);

        $closeButton.click(function() {
            $("#error").text("");
            $("#error").hide();
        });
    },

    matchUser = function(e) {

        $("#preferences").hide();
        $("#messagesContainer").show();

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
                        $("#messages").append($("<p>").addClass("sent").append($("<p>").text($("#message").val()).append($("<p>").addClass("time").text(addTime()))));
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
                setUpFeedback(feedback);
            });
        } else {
            addFeedbackInChat("You aren't matched with anyone.");
        }
    },

    reportUser = function() {
        if (userMatched) {
            socket.emit("report", function(feedback) {
                setUpFeedback(feedback);
            });
        } else {
            addFeedbackInChat("You aren't matched with anyone.");
        }
    },

    blocked = function() {
        $("#startContainer").show();
        $("#feedbackContainer").show();
        $("#chat").hide();
        $("#chatButtons").hide();
        $("#messageForm").hide();
        $("#feedbackContainer").toggleClass("panel-danger", true);
        $("#feedbackContainer").toggleClass("panel-primary", false);
        $("#feedbackContainer").toggleClass("panel-success", false);

        $("#feedback").text("You have been blocked.");

        sendNotifications("You have been blocked.");
        $("#notificationSound")[0].play();
        userMatched = false;
    },

    sendNotifications = function(notification) {

        if (!handleVisibilityChange()) {

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
    setUpFeedback("User has left the chat.");
    sendNotifications("User has left the chat.");
    $("#notificationSound")[0].play();
});

$("#textSend").submit(sendMessage);

socket.on("receive message", function(msg) {

    addDate();

    var time = addTime();

    var difference = $(document).height() - $(document).scrollTop() == $(window).height();

    $("#messages").append($("<p>").addClass("received").append($("<p>").text(msg).append($("<p>").addClass("time").text(time))));

    if (difference) {
        $("html, body").animate({scrollTop: $(document).height() - $(window).height()});
    } else {
        $("#newMessage").show();
    }

    $("#notificationSound")[0].play();

    sendNotifications("User has messaged you.");
});

$("#skipButton").click(skipUser);

$("#reportButton").click(reportUser);

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