var socket = io();

$('#messageForm').submit(function () {
    if ($('#message').val().trim() !== "") {
        socket.emit('send message', $('#message').val());
        $('#messages').append($('<li>').text($('#message').val()));
        $('#message').val('');
    }
    return false;
});

socket.on('receive message', function (msg) {
    $('#messages').append($('<li>').text(msg));
});