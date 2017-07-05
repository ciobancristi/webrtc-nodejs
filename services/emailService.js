'use strict';
const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
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

emailService.sendMail = (to, clientName, userEmailTemplate) => {
    let emailTemplate;
    if (userEmailTemplate) {
        emailTemplate = userEmailTemplate;
    } else {
        emailTemplate = prepareEmail(to, clientName);
    }

    if (!emailTemplate.to || !emailTemplate.html) {
        return { success: false, message: "Missing destination email or body" };
    }

    transporter.sendMail(emailTemplate, (error, info) => {
        if (error) {
            console.log(error);
            return { success: false, message: error };
        }
        console.log('Email %s sent: %s', info.messageId, info.response);
        return { success: true };
    });
}

module.exports = emailService;