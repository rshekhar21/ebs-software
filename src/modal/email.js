const nodemailer = require('nodemailer');


function sendEmail(prams, mailOptions) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: true, // use SSL
        // secure: false,
        // requireTLS: false,
        auth: {
            user: prams.service_email, //source email address
            pass: prams.email_pwd //password, use app-password created by gmail
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                reject(error);
            } else {
                console.log('ok');
                resolve({ msg: 'Email Sent', info: info.response });
            }
        })
    });
}

module.exports = { sendEmail };
