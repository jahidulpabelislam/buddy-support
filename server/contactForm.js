//Code which handles when user tries to send a message
module.exports = function(req, res) {

    //test the email address provided using RegEx
    const validEmailPattern = /\b[\w._-]+@[\w-]+.[\w]{2,}\b/im,
        result = validEmailPattern.test(req.body.emailInput);

    //check if data provided is valid
    if (((req.body.contactType === "Enquiry" && result) || req.body.contactType === "Message") && req.body.messageInput.trim() !== "") {

        const nodeMailer = require("nodemailer"),
            transporter = nodeMailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'jahidulwebapp@gmail.com',
                    pass: 'mynewbuddysupportpassword'
                }
            }),

            //set up the mail to send
            mailOptions = {
                replyTo: req.body.contactType === "Enquiry" ? req.body.emailInput : "",
                to: 'up733474@myport.ac.uk',
                subject: req.body.subjectInput || req.body.contactType === "Enquiry" ? 'Buddy Support Enquiry' : 'Buddy Support Message',
                text: req.body.messageInput
            };

        //try and send the mail
        transporter.sendMail(mailOptions, function(error) {
            //send back the necessary feedback back to user
            res.send(JSON.stringify({
                ok: !error,
                feedback: error ? "Something went wrong, please try again later.": "Your message has been sent."
            }));
        });

    }
    //else message inputs aren't valid
    else {
        //set up the feedback
        var response = {ok: false};

        //if the message is a enquiry is a email address provided
        if (req.body.contactType === "Enquiry" && req.body.emailInput.trim() === "") {
            response.emailFeedback = "Email Address must be provided and valid.";
        }
        //else if it is a enquiry is the emaill address valid
        else if (req.body.contactType === "Enquiry" && !result) {
            response.emailFeedback = "Email Address must be valid.";
        }

        //is the message provided
        if (req.body.messageInput.trim() === "") {
            response.messageFeedback = "Message must be provided.";
        }

        //send back the feedback
        res.send(JSON.stringify(response));
    }
};