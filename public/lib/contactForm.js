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

        $("#loading").hide();

    },
    error = function () {
        $("#feedback").text("Something went wrong, please try again later.");
        $("#loading").hide();
    };

$("#contactForm").submit(function () {
    $("#feedback").text("");
    $("#loading").show();

    //validate each required user input
    var emailValidation = validateEmail($("#emailInput").val(), true),
        messageValidation = validateMessage($("#messageInput").val(), true);

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
            success: renderFeedback,
            error: error
        });
    } else {
        $("#loading").hide();
    }

    return false;
});

//validate the email address
var validateEmail = function (email, isForm) {
        var validEmailPattern = /\b[\w._-]+@[\w-]+.[\w]{2,}\b/im,
            result = validEmailPattern.test(email);

        //checks if email is empty
        if (email.trim() === "" && isForm) {
            $("#emailFeedback").text("Email Address must be provided and valid.");
            return false;
        }
        //checks if email is valid
        else if (!result && isForm) {
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
    validateMessage = function (message, isForm) {

        //checks is message is empty
        if (message.trim() === "" && isForm) {
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