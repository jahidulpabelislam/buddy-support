var socket = io();

socket.on("receive message", function (msg) {
    $("#messages").append($("<li>").addClass("partner").text(msg));
});

socket.on("matched", function () {
    setUpChat();
});

socket.on("unmatched", function () {
    $("#messages").empty();
    $("#skipForm").hide();
    $("#messageForm").submit(function () {
        return false;
    });

    socket.emit("match", function (matched) {
        if (matched) {
            setUpChat();
        } else {
            $("#skipForm").hide();
        }
    });
});

$("#startForm").submit(function () {
    socket.emit("match", function (matched) {
        if (matched) {
            setUpChat();
        } else {
            $("#skipForm").hide();
        }
    });

    return false;
});

$("#messageForm").submit(function () {
    return false;
});

$("#skipForm").submit(function () {
    return false;
});

var setUpChat = function () {
    $("#messages").empty();

    $("#messageForm").submit(function () {
        if ($("#message").val().trim() !== "") {
            socket.emit("send message", $("#message").val());
            $("#messages").append($("<li>").addClass("user").text($("#message").val()));
            $("#message").val('');
        }
        return false;
    });

    $("#startForm").hide();

    $("#skipForm").show();

    $("#skipForm").submit(function () {
        socket.emit("skip", function (matched, user) {
            console.log(user);
            if (matched) {
                setUpChat();
            } else {
                $("#messages").empty();
                $("#skipForm").hide();
            }
        });
        return false;
    });
};