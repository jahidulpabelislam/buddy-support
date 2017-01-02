var socket = io(),
    userMatched = false,

    setUpFeedback = function (matched, feedback) {
        userMatched = matched;
        $("#messages").empty();
        $("#skipButton").hide();
        $("#reportButton").hide();
        $("#feedback").text(feedback);
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
        socket.emit("match", function (matched, feedback) {
            userMatched = matched;
            if (feedback) $("#feedback").text(feedback);
            if (matched && !feedback) {
                setUpChat();
            } else if (!matched) {
                $("#messages").empty();
                $("#skipButton").hide();
                $("#reportButton").hide();
                $("#startButton").show();
            }
        });
    },

    sendMessage = function () {
        if (userMatched) {
            if ($("#message").val().trim() !== "") {
                socket.emit("send message", $("#message").val());
                $("#messages").append($("<li>").addClass("sent").text($("#message").val()));
                $("#message").val('');
            }
        }
    },

    skipUser = function () {
        if (userMatched) {
            socket.emit("skip", function (feedback) {
                setUpFeedback(false, feedback);
                $("#startButton").show();
            });
        }
    },
    
    sendFiles = function (e) {
        if (userMatched) {

            var files = e.target.files;

            for (var i = 0; i < files.length; i++) {

                var fileReader;

                //gets file
                fileReader = new FileReader();
                fileReader.readAsDataURL(files[i]);

                //checks if file is a image
                if (files[i].type.includes("image/")) {

                    fileReader.onload = function (e) {
                        socket.emit("send image", e.target.result, function (error) {
                            if (error) {
                                $("#feedback").text(error);
                            } else {
                                $("#messages").append($("<li>").addClass("sent").append("<img src='" + e.target.result + "'>"));
                            }

                        });

                    };
                }
                //checks if file is a video
                else if (files[i].type.includes("video/")) {

                    fileReader.onload = function (e) {
                        socket.emit("send video", e.target.result, function (error) {
                            if (error) {
                                $("#feedback").text(error);
                            } else {
                                $("#messages").append($("<li>").addClass("sent").append("<video src='" + e.target.result + "' controls>"));
                            }

                        });

                    };
                }
                //checks if file is a audio
                else if (files[i].type.includes("audio/")) {

                    fileReader.onload = function (e) {
                        socket.emit("send audio", e.target.result, function (error) {
                            if (error) {
                                $("#feedback").text(error);
                            } else {
                                $("#messages").append($("<li>").addClass("sent").append("<audio src='" + e.target.result + "' controls>"));
                            }

                        });

                    };
                }
            }
            e.target.value = "";
        }
    },

    reportUser = function () {
        if (userMatched) {
            socket.emit("report", function (feedback) {
                setUpFeedback(false, feedback);
                $("#startButton").show();
            });
        }
    };

$("#startButton").click(matchUser);

socket.on("matched", setUpChat);

socket.on("unmatched", function () {
    setUpFeedback(false, "User has left.");
    $("#startButton").show();
});

$("#textSend").click(sendMessage);

socket.on("receive message", function (msg) {
    $("#messages").append($("<li>").addClass("received").text(msg));
});

$("#skipButton").click(skipUser);

$(".filesSend").click(function (e) {
    if (!userMatched) {
        e.preventDefault();
    }
});

$(".filesSend").change(sendFiles);

socket.on("receive image", function (image) {
    $("#messages").append($("<li>").addClass("received").append("<img src='" + image + "'>"));
});

socket.on("receive video", function (video) {
    $("#messages").append($("<li>").addClass("received").append("<video src='" + video + "' controls>"));
});

socket.on("receive audio", function (audio) {
    $("#messages").append($("<li>").addClass("received").append("<audio src='" + audio + "' controls>"));
});

$("#reportButton").click(reportUser);

socket.on("blocked", function () {
    setUpFeedback(false, "You have been blocked.");
});