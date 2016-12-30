var renderFeedback = function (result) {
    result = JSON.parse(result);

    if (result.feedback) {
        $("#feedback").text(result.feedback);
    } else {
        $("#feedback").text("");
    }

    if (result.ok) {
        $("#emailInput").val("");
        $("#subjectInput").val("");
        $("#messageInput").val("");
    }

    if (result.emailFeedback) {
        $("#emailFeedback").text(result.emailFeedback);
    } else {
        $("#emailFeedback").text("");
    }

    if (result.messageFeedback) {
        $("#messageFeedback").text(result.messageFeedback);
    } else {
        $("#messageFeedback").text("");
    }

};

$("#contactForm").submit(function () {
    $("#feedback").text("");

    //validate each required user input
    var emailValidation = validateEmail($("#emailInput").val()),
        messageValidation = validateMessage($("#messageInput").val());

    //if form is valid send a request with necessary data to XHR
    if (emailValidation && messageValidation) {
        $.ajax({
            url: '/contact',
            type: 'POST',
            data: {
                emailInput: $("#emailInput").val(),
                subjectInput: $("#subjectInput").val(),
                messageInput: $("#messageInput").val()
            },
            success: renderFeedback
        });
    }

    return false;
});

//validate the email address
var validateEmail = function (mail) {
        var validEmailPattern = /\b[\w._-]+@[\w-]+.[\w]{2,}\b/im,
            result = validEmailPattern.test(mail);

        //checks if email is empty
        if (mail.trim() === "") {
            $("#emailFeedback").text("Email Address must be provided and valid.");
            return false;
        }
        //checks if email is valid
        else if (!result) {
            //give user message
            $("#emailFeedback").text("Email Address must be valid.");
            return false;
        }
        //else remove feedback message
        else {
            $("#emailFeedback").text("");
            return true;
        }

    },

    //validate the message input
    validateMessage = function (mess) {

        //checks is message is empty
        if (mess.trim() === "") {
            //give user message
            $("#messageFeedback").text("Message must be filled out.");
            return false;
        }
        //else remove feedback messages
        else {
            $("#messageFeedback").text("");
            return true;
        }
    };
