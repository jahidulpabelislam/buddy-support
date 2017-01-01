var socket = io(),
    userMatched = false,

    setUpChat = function () {
        $("#messages").empty();

        $("#startButton").hide();

        $("#skipButton").show();

        $("#reportButton").show();

        $("#feedback").text("");

        userMatched = true;
    },

    matchUser = function () {
        socket.emit("match", function (matched) {
            if (matched) {
                setUpChat();
            } else {
                $("#messages").empty();
                $("#skipButton").hide();
                $("#reportButton").hide();
                $("#feedback").text("No Users Available.");
                userMatched = false;
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
            socket.emit("skip", matchUser);
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
                        socket.emit("send image", e.target.result);
                        $("#messages").append($("<li>").addClass("sent").append("<img src='" + e.target.result + "'>"));
                    };
                }
                //checks if file is a video
                else if (files[i].type.includes("video/")) {

                    fileReader.onload = function (e) {
                        socket.emit("send video", e.target.result);
                        $("#messages").append($("<li>").addClass("sent").append("<video src='" + e.target.result + "' controls>"));
                    };
                }
                //checks if file is a audio
                else if (files[i].type.includes("audio/")) {

                    fileReader.onload = function (e) {
                        socket.emit("send audio", e.target.result);
                        $("#messages").append($("<li>").addClass("sent").append("<audio src='" + e.target.result + "' controls>"));
                    };
                }
            }
            e.target.value = "";
        }
    },

    reportUser = function () {
        if (userMatched) {
            socket.emit("report", matchUser);
        }
    };

$("#startButton").click(function () {
    $("#startButton").hide();
    socket.emit("start");
    matchUser();
});

socket.on("matched", setUpChat);

socket.on("unmatched", matchUser);

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
    $("#messages").empty();
    $("#skipForm").hide();
    $("#reportForm").hide();
    $("#feedback").text("You have been blocked.");
    userMatched = false;
});