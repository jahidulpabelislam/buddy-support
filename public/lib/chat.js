var socket = io(),
    userMatched = false,

    setUpFeedback = function (matched, feedback) {
        $("#chat").hide();
        $("#chatButtons").hide();
        $("#startContainer").show();
        $("#feedback").text(feedback);
        userMatched = matched;
    },

    setUpChat = function () {
        $("#messages").empty();
        $("#chat").show();
        $("#messageForm").show();
        $("#chatButtons").show();
        $("#startContainer").hide();
        $("#motivationalMessage").hide();
        userMatched = true;
        expandSection();
    },

    matchUser = function () {

        $("#feedback").text("Finding a match...");

        socket.emit("match", function (matched, feedback, waitingMessage, blocked) {
            userMatched = matched;
            if (feedback) {
                $("#feedback").text(feedback);
            }

            if (matched) {
                setUpChat();
            } else if (waitingMessage) {
                $("#preferences").hide();
                $("#startContainer").show();
                $("#startButton").hide();
                $("#chat").hide();
                $("#motivationalMessage").show();
                $("#motivationalMessage").text(waitingMessage);
            } else if (blocked){
                $("#preferences").hide();
                $("#startContainer").show();
            }
        });
    },

    sendMessage = function (e) {
        if (userMatched) {
            if ($("#message").val().trim() !== "") {
                socket.emit("send message", $("#message").val(), function (error) {
                    if (error) {
                        $("#feedback").text(error);
                    } else {
                        var difference = $(document).height() - $(document).scrollTop() == $(window).height();

                        $("#messages").append($("<p>").addClass("sent").text($("#message").val()));
                        $("#message").val("");
                        if (difference) {
                            $("html, body").animate({ scrollTop: $(document).height()-$(window).height() });
                        }
                    }
                });
            }
        } else {
            $("#feedback").text("You aren't matched with anyone.");
        }
        e.preventDefault();
    },

    skipUser = function () {
        if (userMatched) {
            socket.emit("skip", function (feedback) {
                setUpFeedback(false, feedback);
                $("#preferences").show();
                $("#startButton").show();
                $("#messageForm").hide();
            });
        } else {
            $("#feedback").text("You aren't matched with anyone.");
        }
    },

    reportUser = function () {
        if (userMatched) {
            socket.emit("report", function (feedback) {
                setUpFeedback(false, feedback);
                $("#preferences").show();
                $("#startButton").show();
                $("#messageForm").hide();
            });
        } else {
            $("#feedback").text("You aren't matched with anyone.");
        }
    };

$("#startButton").click(matchUser);

socket.on("matched", setUpChat);

socket.on("unmatched", function () {
    setUpFeedback(false, "User has left.");
    $("#preferences").show();
    $("#startButton").show();
    $("#messageForm").hide();
});

$("#textSend").submit(sendMessage);

socket.on("receive message", function (msg) {
    var difference = $(document).height() - $(document).scrollTop() == $(window).height();

    $("#messages").append($("<p>").addClass("received").text(msg));

    if (difference) {
        $("html, body").animate({ scrollTop: $(document).height()-$(window).height() });
    }
});

$("#skipButton").click(skipUser);

$("#reportButton").click(reportUser);

socket.on("blocked", function () {
    setUpFeedback(false, "You have been blocked.");
    $("#preferences").hide();
    $("#messageForm").hide();
});

$("#preferences").change(function() {
    var talks = [];
    $.each($("input[name='talk']:checked"), function(){
        talks.push($(this).val());
    });

    var data = {
        type: $("input[name='type']:checked").val(),
        talks: talks
    };

    socket.emit("change preferences", data);
});