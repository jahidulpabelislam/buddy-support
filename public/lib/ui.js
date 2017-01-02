var socket = io(),
    userMatched = false,
    lastMessageDate,

    addDate = function () {
        var dateText;
        var thisMessageDate = new Date();

        //checks if message is sent on the same day as last
        if ((lastMessageDate === undefined) || (lastMessageDate.getDate() !== thisMessageDate.getDate() && thisMessageDate.getMonth() !== thisMessageDate.getMonth()
            && thisMessageDate.getFullYear() !== thisMessageDate.getFullYear())) {
            dateText = days[thisMessageDate.getDay()] + " " + getDateEnding(thisMessageDate.getDate()) + " " + months[thisMessageDate.getMonth()] + " " + thisMessageDate.getFullYear();
            $("#messages").append($("<li>").addClass("date").text(dateText));
        }
        lastMessageDate = thisMessageDate;
    },

    addTime = function () {
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
                        addDate();
                        var time = addTime();
                        $("#messages").append($("<li>").addClass("sent").text($("#message").val()).append($("<span>").addClass("time").text(time)));
                        $("#message").val('');
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
                                addDate();
                                var time = addTime();
                                $("#messages").append($("<li>").addClass("sent").append("<img src='" + e.target.result + "'>").append($("<span>").addClass("time").text(time)));
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
                                addDate();
                                var time = addTime();
                                $("#messages").append($("<li>").addClass("sent").append("<video src='" + e.target.result + "' controls>").append($("<span>").addClass("time").text(time)));
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
                                addDate();
                                var time = addTime();
                                $("#messages").append($("<li>").addClass("sent").append("<audio src='" + e.target.result + "' controls>").append($("<span>").addClass("time").text(time)));
                            }

                        });

                    };
                }
            }
            e.target.value = "";
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
    addDate();
    var time = addTime();
    $("#messages").append($("<li>").addClass("received").text(msg).append($("<span>").addClass("time").text(time)));
});

$("#skipButton").click(skipUser);

$(".filesSend").click(function (e) {
    if (!userMatched) {
        e.preventDefault();
        $("#feedback").text("You aren't matched with anyone.");
    }
});

$(".filesSend").change(sendFiles);

socket.on("receive image", function (image) {
    addDate();
    var time = addTime();
    $("#messages").append($("<li>").addClass("received").append("<img src='" + image + "'>").append($("<span>").addClass("time").text(time)));
});

socket.on("receive video", function (video) {
    addDate();
    var time = addTime();
    $("#messages").append($("<li>").addClass("received").append("<video src='" + video + "' controls>").append($("<span>").addClass("time").text(time)));
});

socket.on("receive audio", function (audio) {
    addDate();
    var time = addTime();
    $("#messages").append($("<li>").addClass("received").append("<audio src='" + audio + "' controls>").append($("<span>").addClass("time").text(time)));
});

$("#reportButton").click(reportUser);

socket.on("blocked", function () {
    setUpFeedback(false, "You have been blocked.");
});