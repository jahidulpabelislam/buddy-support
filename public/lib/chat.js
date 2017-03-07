var socket = io(),
    userMatched = false,

    setUpFeedback = function(feedback) {
        $("#startContainer").show();
        $("#feedbackContainer").show();
        $("#chat").hide();
        $("#chatButtons").hide();
        $("#messageForm").hide();
        $button = $('<button/>').text('OK').addClass("btn btn-success").click(function() {
            $("#preferences").show();
            $("#messagesContainer").hide();
        });
        $("#feedback").text(feedback).append($button);
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
        expandSection();
    },

    matchUser = function(e) {

        $("#preferences").hide();
        $("#messagesContainer").show();

        $("#feedback").text("Finding a match...");

        socket.emit("match", function(matched, feedback, waitingMessage, blocked) {

            userMatched = matched;

            if (feedback) {
                $("#feedback").text(feedback);
            }

            if (matched) {
                setUpChat();
            } else if (waitingMessage) {
                $("#motivationalMessage").show();
                $("#motivationalMessage").text(waitingMessage);
            } else if (blocked) {
                $("#feedback").text("You have been blocked.");
            }
        });

        e.preventDefault();
    },

    sendMessage = function(e) {
        if (userMatched) {
            if ($("#message").val().trim() !== "") {
                socket.emit("send message", $("#message").val(), function(error) {
                    if (error) {
                        $("#feedback").text(error);
                    } else {

                        $("#messages").append($("<p>").addClass("sent").text($("#message").val()));
                        $("#message").val("");
                        $("html, body").animate({scrollTop: $(document).height() - $(window).height()});
                    }
                });
            }
        } else {
            $("#feedback").text("You aren't matched with anyone.");
        }
        e.preventDefault();
    },

    skipUser = function() {
        if (userMatched) {
            socket.emit("skip", function(feedback) {
                setUpFeedback(feedback);
            });
        } else {
            $("#feedback").text("You aren't matched with anyone.");
        }
    },

    reportUser = function() {
        if (userMatched) {
            socket.emit("report", function(feedback) {
                setUpFeedback(feedback);
            });
        } else {
            $("#feedback").text("You aren't matched with anyone.");
        }
    };

$("#preferences").submit(matchUser);

socket.on("matched", setUpChat);

socket.on("unmatched", function() {
    setUpFeedback("User has left the chat.");
});

$("#textSend").submit(sendMessage);

socket.on("receive message", function(msg) {
    var difference = $(document).height() - $(document).scrollTop() == $(window).height();

    $("#messages").append($("<p>").addClass("received").text(msg));

    if (difference) {
        $("html, body").animate({scrollTop: $(document).height() - $(window).height()});
    }
});

$("#skipButton").click(skipUser);

$("#reportButton").click(reportUser);

socket.on("blocked", function() {
    $("#startContainer").show();
    $("#feedbackContainer").show();
    $("#chat").hide();
    $("#chatButtons").hide();
    $("#messageForm").hide();
    $("#feedback").text("You have been blocked.");
    userMatched = false;
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