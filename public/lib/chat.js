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
        userMatched = true;
        expandSection();
    },

    matchUser = function () {

        $("#feedback").text("Finding a match...");

        socket.emit("match", function (matched, feedback, waiting) {
            userMatched = matched;
            if (feedback) $("#feedback").text(feedback);

            if (matched && !feedback) {
                setUpChat();
            } else if (waiting) {
                $("#preferences").hide();
                $("#startContainer").show();
                $("#startButton").hide();
                $("#chat").hide();
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
                        $("#messages").append($("<p>").addClass("sent").text($("#message").val()));
                        $("#message").val("");
                        $("html, body").animate({ scrollTop: $(document).height()-$(window).height() });
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
});

$("#textSend").submit(sendMessage);

socket.on("receive message", function (msg) {
    $("#messages").append($("<p>").addClass("received").text(msg));
    $("html, body").animate({ scrollTop: $(document).height()-$(window).height() });
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

    socket.emit("change preferences", data);
});