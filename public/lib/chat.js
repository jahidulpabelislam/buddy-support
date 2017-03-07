var socket = io(),
    userMatched = false,

    setUpFeedback = function(feedback) {
        $("#startContainer").show();
        $("#feedbackContainer").show();
        $("#chat").hide();
        $("#chatButtons").hide();
        $("#messageForm").hide();
        $("#feedbackContainer" ).toggleClass("panel-primary", true);
        $("#feedbackContainer" ).toggleClass("panel-success", false);
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

        $("#messages").append($("<p>").attr("id", "userDisplay").append($("<p>").text("↓ Matched User").addClass("matched")).append($("<p>").text("You ↓").addClass("user")));
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
                $("#feedbackContainer" ).toggleClass("panel-primary", true);
                $("#feedbackContainer" ).toggleClass("panel-success", false);
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
                        $("#feedback").text(error);
                    } else {
                        $("#messages").append($("<p>").addClass("sent").append($("<p>").text($("#message").val())));
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
    },

    blocked = function() {
        $("#startContainer").show();
        $("#feedbackContainer").show();
        $("#chat").hide();
        $("#chatButtons").hide();
        $("#messageForm").hide();
        $("#feedbackContainer" ).toggleClass("panel-danger", true);
        $("#feedbackContainer" ).toggleClass("panel-primary", false);
        $("#feedbackContainer" ).toggleClass("panel-success", false);
        $("#feedback").text("You have been blocked.");
        userMatched = false;
    };

$("#preferences").submit(matchUser);

socket.on("matched", setUpChat);

socket.on("unmatched", function() {
    setUpFeedback("User has left the chat.");
});

$("#textSend").submit(sendMessage);

socket.on("receive message", function(msg) {
    var difference = $(document).height() - $(document).scrollTop() == $(window).height();

    $("#messages").append($("<p>").addClass("received").append($("<p>").text(msg)));

    if (difference) {
        $("html, body").animate({scrollTop: $(document).height() - $(window).height()});
    }
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