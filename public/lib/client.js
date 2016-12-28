var socket = io(),
    userMatched = false,

    setUpChat = function () {
        $("#messages").empty();

        $("#startForm").hide();

        $("#skipForm").show();

        $("#feedback").text("");

        userMatched = true;
    },

    matchUser = function (e) {
        socket.emit("match", function (matched) {
            if (matched) {
                setUpChat();
            } else {
                $("#messages").empty();
                $("#skipForm").hide();
                $("#feedback").text("No Users Available.");
                userMatched = false;
            }
        });
        if (e) e.preventDefault();
    },

    sendMessage = function (e) {
        if (userMatched) {
            if ($("#message").val().trim() !== "") {
                socket.emit("send message", $("#message").val());
                $("#messages").append($("<li>").addClass("sent").text($("#message").val()));
                $("#message").val('');
            }
        }
        e.preventDefault();
    },

    skipUser = function (e) {
        if (userMatched) {
            socket.emit("skip", matchUser);
        }
        e.preventDefault();
    },
    
    sendFiles = function (e) {
        if (userMatched) {
            var files = $("#filesSend")[0].files;

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
        }
        $("#filesSend").val('');
    };

$("#startForm").submit(function (e) {
    $("#startForm").hide();
    socket.emit("start");
    matchUser(e);
});

socket.on("matched", setUpChat);

socket.on("unmatched", matchUser);

$("#messageForm").submit(sendMessage);

socket.on("receive message", function (msg) {
    $("#messages").append($("<li>").addClass("received").text(msg));
});

$("#skipForm").submit(skipUser);

$("#filesSend").change(sendFiles);

socket.on("receive image", function (image) {
    $("#messages").append($("<li>").addClass("received").append("<img src='" + image + "'>"));
});

socket.on("receive video", function (video) {
    $("#messages").append($("<li>").addClass("received").append("<video src='" + video + "' controls>"));
});

socket.on("receive audio", function (audio) {
    $("#messages").append($("<li>").addClass("received").append("<audio src='" + audio + "' controls>"));
});