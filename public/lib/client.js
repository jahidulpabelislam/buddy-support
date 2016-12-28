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
    
    sendImages = function () {
        if (userMatched) {
            var imagesUpload = $("#imageSend")[0];

            for (var i = 0; i < imagesUpload.files.length; i++) {

                var fileReader;

                //checks if file is a image
                if (imagesUpload.files[i].type.includes("image/")) {
                    //gets image
                    fileReader = new FileReader();

                    fileReader.readAsDataURL(imagesUpload.files[i]);

                    fileReader.onload = function (e) {
                        socket.emit("send image", e.target.result);
                        $("#messages").append($("<li>").addClass("sent").append("<img src='" + e.target.result + "'>"));
                    };
                }
            }
        }
    },

    sendVideos = function () {
        if (userMatched) {
            var videosUpload = $("#videoSend")[0];

            for (var i = 0; i < videosUpload.files.length; i++) {

                var fileReader;

                //checks if file is a image
                if (videosUpload.files[i].type.includes("video/")) {
                    //gets video
                    fileReader = new FileReader();

                    fileReader.readAsDataURL(videosUpload.files[i]);

                    fileReader.onload = function (e) {
                        socket.emit("send video", e.target.result);
                        $("#messages").append($("<li>").addClass("sent").append("<video src='" + e.target.result + "' controls>"));
                    };
                }
            }
        }
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

$("#imageSend").change(sendImages);

socket.on("receive image", function (image) {
    $("#messages").append($("<li>").addClass("received").append("<img src='" + image + "'>"));
});

$("#videoSend").change(sendVideos);

socket.on("receive video", function (video) {
    $("#messages").append($("<li>").addClass("received").append("<video src='" + video + "' controls>"));
});