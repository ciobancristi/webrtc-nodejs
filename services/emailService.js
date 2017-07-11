'use strict';
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    }
});

let prepareEmail = (to, clientName) => {
    let emailTemplate = {
        from: '"Home Security System" ' + process.env.SMTP_EMAIL,
        subject: 'Security breach',
        to: to,
        html: '<p> Client <strong>' + clientName +
        "</strong> encountered a security issue.</p>" +
        "<br/>Please provide assistance!"
    };
    return emailTemplate;
}

var emailService = {};

emailService.sendMail = (to, clientName, userEmailTemplate, callback) => {
    let emailTemplate = prepareEmail(to, clientName);
    if (userEmailTemplate) {
        emailTemplate.html = userEmailTemplate;
    }

    if (!emailTemplate.to || !emailTemplate.html) {
        return { success: false, message: "Missing destination email or body" };
    }

    transporter.sendMail(emailTemplate, (error, info) => {
        if (error) {
            console.log(error);
            return callback({ success: false, message: error });
        }
        console.log('Email %s sent: %s', info.messageId, info.response);
        return callback({ success: true });
    })

}

module.exports = emailService;