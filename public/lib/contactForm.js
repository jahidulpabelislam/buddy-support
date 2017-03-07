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
            $("#feedback").text(result.feedback).addClass("success");
        } else {
            $("#feedback").addClass("error");
        }

        if (result.emailFeedback) {
            $("#emailFeedback").text(result.emailFeedback).addClass("error");
            $("#emailInput").addClass("invalid");
        } else {
            $("#emailFeedback").text("").removeClass("error");
            $("#emailInput").removeClass("invalid");
        }

        if (result.messageFeedback) {
            $("#messageFeedback").text(result.messageFeedback).addClass("error");
            $("#messageInput").addClass("invalid");
        } else {
            $("#messageFeedback").text("").removeClass("error");
            $("#messageInput").removeClass("invalid");
        }

        $("#loading").hide();

    },
    error = function () {
        $("#feedback").text("Something went wrong, please try again later.").addClass("error");
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
            data: $('#contactForm').serialize(),
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
            $("#emailInput").addClass("invalid");
            $("#emailFeedback").text("Email Address must be provided and valid.").addClass("error");
            return false;
        }
        //checks if email is valid
        else if (!result && isForm) {
            //give user message
            $("#emailInput").addClass("invalid");
            $("#emailFeedback").text("Email Address must be valid.").addClass("error");
            return false;
        }
        //else remove feedback message
        else if (email.trim() !== "" && result) {
            $("#emailInput").removeClass("invalid");
            $("#emailFeedback").text("").removeClass("error");
            return true;
        }

        $("#feedback").text("");

    },

    //validate the message input
    validateMessage = function (message, isForm) {

        //checks is message is empty
        if (message.trim() === "" && isForm) {
            //give user message
            $("#messageInput").addClass("invalid");
            $("#messageFeedback").text("Message must be filled out.").addClass("error");
            return false;
        }
        //else remove feedback messages
        else if (message.trim() !== "") {
            $("#messageInput").removeClass("invalid");
            $("#messageFeedback").text("").removeClass("error");
            return true;
        }

        $("#feedback").text("");
    };