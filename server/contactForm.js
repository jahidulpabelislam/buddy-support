module.exports = function(req, res) {

    const nodeMailer = require("nodemailer"),
        validEmailPattern = /\b[\w._-]+@[\w-]+.[\w]{2,}\b/im,
        result = validEmailPattern.test(req.body.emailInput);

    if (req.body.emailInput.trim() !== "" && req.body.messageInput.trim() !== "" && result) {

        const transporter = nodeMailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'jahidulwebapp@gmail.com',
                    pass: 'myuniapppassword'
                }
            }),

            mailOptions = {
                replyTo: req.body.emailInput,
                to: 'up733474@myport.ac.uk',
                subject: req.body.subjectInput || 'Buddy Support Email',
                text: req.body.messageInput
            };

        transporter.sendMail(mailOptions, function(error) {
            res.send(JSON.stringify({
                ok: !error,
                feedback: error ? "Something went wrong, please try again later." : "Your message has been sent."
            }));
        });

    } else {
        var response = {ok: false};

        if (req.body.emailInput.trim() === "") {
            response.emailFeedback = "Email Address must be provided and valid.";
        } else if (!result) {
            response.emailFeedback = "Email Address must be valid.";
        }

        if (req.body.messageInput.trim() === "") {
            response.messageFeedback = "Message must be provided.";
        }

        res.send(JSON.stringify(response));
    }
};