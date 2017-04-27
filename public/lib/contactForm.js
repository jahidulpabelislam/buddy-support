var renderFeedback = function(result) {
        result = JSON.parse(result);

        if (result.feedback) {
            $("#feedback").text(result.feedback);
        } else {
            $("#feedback").text("");
        }

        if (result.ok) {
            $("#emailInput, #messageInput, subjectInput").val("");
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

        $("#submit").button('reset');

    },
    error = function() {
        $("#feedback").text("Something went wrong, please try again later.").addClass("error");
        $("#submit").button('reset');
    };

$("#contactForm").submit(function() {
    $("#submit").button('loading');

    var type = $("#contactType").val();

    //Validates each required user input
    var messageValidation = validateMessage($("#messageInput").val(), true);

    if (type === "Enquiry") {
        var emailValidation = validateEmail($("#emailInput").val(), true);
    }

    //Checks if form is valid send a request with necessary data to XHR
    if (messageValidation && ((type === "Enquiry" && emailValidation) || (type === "Message"))) {
        $.ajax({
            url: '/contact',
            type: 'POST',
            data: $("#contactForm").serialize(),
            success: renderFeedback,
            error: error
        });
    } else {
        $("#submit").button('reset');
    }

    return false;
});

//Validates the email address
var validateEmail = function(email, isForm) {
        $("#feedback").text("");

        var validEmailPattern = /\b[\w._-]+@[\w-]+.[\w]{2,}\b/im,
            result = validEmailPattern.test(email);

        //Checks if email is empty
        if (email.trim() === "" && isForm) {
            $("#emailInput").addClass("invalid");
            $("#emailFeedback").text("Email Address must be provided and valid.").addClass("error");
            return false;
        }
        //Checks if email is valid
        else if (!result && isForm) {
            //Gives user message
            $("#emailInput").addClass("invalid");
            $("#emailFeedback").text("Email Address must be valid.").addClass("error");
            return false;
        }
        //Else removes feedback message
        else if (email.trim() !== "" && result) {
            $("#emailInput").removeClass("invalid");
            $("#emailFeedback").text("").removeClass("error");
            return true;
        }
    },

    //Validates the message input
    validateMessage = function(message, isForm) {
        $("#feedback").text("");

        //Checks if the message is empty
        if (message.trim() === "" && isForm) {
            //Gives user message
            $("#messageInput").addClass("invalid");
            $("#messageFeedback").text("Message must be filled out.").addClass("error");
            return false;
        }
        //Else remove feedback messages
        else if (message.trim() !== "") {
            $("#messageInput").removeClass("invalid");
            $("#messageFeedback").text("").removeClass("error");
            return true;
        }

    };

//Change the inputs shown on change of message type.
$("#contactType").change(function() {
    var type = $("#contactType").val();

    if (type === "Enquiry") {
        $("#emailGroup").show();
        $("#emailInput").attr("required", true);
    } else if (type === "Message") {
        $("#emailInput").removeAttr("required");
        $("#emailGroup").hide();
    }
});