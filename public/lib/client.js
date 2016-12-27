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

    setUpMessageForm = function (e) {
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
    };

$("#startForm").submit(function () {
    socket.emit("start", matchUser);
    return false;
});

socket.on("matched", function () {
    setUpChat();
});

socket.on("unmatched", matchUser);

$("#messageForm").submit(setUpMessageForm);

socket.on("receive message", function (msg) {
    $("#messages").append($("<li>").addClass("received").text(msg));
});

$("#skipForm").submit(skipUser);