var renderFeedback = function (data) {
    data = JSON.parse(data);
    if (data.ok) {
        $("#feedback").text(data.message);
    } else {
        $("#feedback").text(data.message);
    }
};

$("#contactForm").submit(function () {
    $.ajax({
        url: '/contact',
        type: 'POST',
        data: {
            emailInput: $("#emailInput").value,
            subjectInput: $("#subjectInput").value,
            messageInput: $("#messageInput").value
        },
        success: renderFeedback
    });
    
    return false;
});
