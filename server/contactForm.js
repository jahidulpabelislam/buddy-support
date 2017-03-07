module.exports = function(req, res) {

    const nodeMailer = require("nodemailer"),
        validEmailPattern = /\b[\w._-]+@[\w-]+.[\w]{2,}\b/im,
        result = validEmailPattern.test(req.body.emailInput);

    if (((req.body.contactType === "Enquiry" && req.body.emailInput.trim() !== "" && result) || req.body.contactType === "Message") && req.body.messageInput.trim() !== "") {

        const transporter = nodeMailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'jahidulwebapp@gmail.com',
                    pass: 'myuniapppassword'
                }
            }),

            mailOptions = {
                replyTo: req.body.contactType === "Enquiry" ? req.body.emailInput : "",
                to: 'up733474@myport.ac.uk',
                subject: req.body.subjectInput || req.body.contactType === "Enquiry" ? 'Buddy Support Enquiry' : 'Buddy Support Message',
                text: req.body.messageInput
            };

        transporter.sendMail(mailOptions, function(error) {
            res.send(JSON.stringify({
                ok: !error,
                feedback: error ? "Something went wrong, please try again later." : "Your message has been sent."
            }));
        });

    } else {
        var response = {ok: false, test: req.body};

        if (req.body.contactType === "Enquiry" && req.body.emailInput.trim() === "") {
            response.emailFeedback = "Email Address must be provided and valid.";
        } else if (req.body.contactType === "Enquiry" && !result) {
            response.emailFeedback = "Email Address must be valid.";
        }

        if (req.body.messageInput.trim() === "") {
            response.messageFeedback = "Message must be provided.";
        }

        res.send(JSON.stringify(response));
    }
};