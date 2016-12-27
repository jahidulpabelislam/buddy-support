var socket = io(),
    userMatched = false,

    setUpChat = function () {
        console.log("setUpChat");
        $("#messages").empty();

        $("#startForm").hide();

        $("#skipForm").show();

        $("#feedback").text("");

        userMatched = true;
    },

    matchUser = function () {
        console.log("matchUser");
        socket.emit("skip", function (matched) {
            if (matched) {
                setUpChat();
            } else {
                $("#messages").empty();
                $("#skipForm").hide();
                $("#feedback").text("No Users Available.");
                userMatched = false;
            }
        });
    },

    setUpMessageForm = function (e) {
        console.log("message form");
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
        console.log("skipForm");
        if (userMatched) {
            matchUser();
        }
        e.preventDefault();
    };

$("#startForm").submit(function () {
    matchUser();
    return false;
});

socket.on("matched", function () {
    setUpChat();
});

socket.on("unmatched", function () {
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
});

$("#messageForm").submit(setUpMessageForm);

socket.on("receive message", function (msg) {
    $("#messages").append($("<li>").addClass("received").text(msg));
});

$("#skipForm").submit(skipUser);