var socket = io(),
    userMatched = false,

    setUpFeedback = function (matched, feedback) {
        $("#messages").empty();
        $("#skipButton").hide();
        $("#reportButton").hide();
        $("#feedback").text(feedback);
        userMatched = matched;
    },

    setUpChat = function () {
        $("#messages").empty();
        $("#startButton").hide();
        $("#skipButton").show();
        $("#reportButton").show();
        $("#feedback").text("");
        userMatched = true;
    },

    matchUser = function () {

        $("#feedback").text("Finding a match...");

        socket.emit("match", function (matched, feedback, waiting) {
            userMatched = matched;
            if (feedback) $("#feedback").text(feedback);

            if (matched && !feedback) {
                setUpChat();
            } else if (waiting) {
                $("#messages").empty();
                $("#skipButton").hide();
                $("#reportButton").hide();
                $("#startButton").hide();
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
                        $("#messages").append($("<li>").addClass("sent").text($("#message").val()).append($("<span>")));
                        $("#message").val("");
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
                $("#startButton").show();
            });
        } else {
            $("#feedback").text("You aren't matched with anyone.");
        }
    },

    reportUser = function () {
        if (userMatched) {
            socket.emit("report", function (feedback) {
                setUpFeedback(false, feedback);
                $("#startButton").show();
            });
        } else {
            $("#feedback").text("You aren't matched with anyone.");
        }
    };

$("#startButton").click(matchUser);

socket.on("matched", setUpChat);

socket.on("unmatched", function () {
    setUpFeedback(false, "User has left.");
    $("#startButton").show();
});

$("#textSend").submit(sendMessage);

socket.on("receive message", function (msg) {
    $("#messages").append($("<li>").addClass("received").text(msg).append($("<span>")));
});

$("#skipButton").click(skipUser);

$("#reportButton").click(reportUser);

socket.on("blocked", function () {
    setUpFeedback(false, "You have been blocked.");
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

    socket.emit("change preferences", data, function (feedback) {
        setUpFeedback(false, feedback);
        $("#startButton").show();
    });
});