'use strict';
const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: 'flost18@gmail.com',
        pass: '!AM1Parola'
    }
});

// setup email data with unicode symbols
let mailOptions = {
    from: '"Home Security System" <flost18@gmail.com>', // sender address
    to: 'ciobancristi@gmail.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world ?', // plain text body
    html: '<b>Hello world ?</b>' // html body
};

// send mail with defined transport object

var emailService = {};

emailService.sendMail = () => {
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Email %s sent: %s', info.messageId, info.response);
    });
}

module.exports = emailService;