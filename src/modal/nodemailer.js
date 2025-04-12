const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  seture: true,
  auth: {
    user: 'service.myebs@gmail.com',//soruce email address
    pass: 'rzme qore imli wjsd' //password, use app-password created by gmail
  },
  tls: {
      rejectUnauthorized: false
  }
});

const mailOptions_test = {
  from: '"EBS"<service.myebs@gmail.com>',
  to: 'rshekhar21@gmail.com',
  subject: 'Test Email',
  html: '<h1>Welcome</h1><p>That was easy!</p>',
  // html: `
  //       <div style="font-size: 1.2px; line-height: 1.5;">
  //           <p style="font-size: 12px;">Enter this code to Activate you Email.</p>
  //           <p style="font-size: 24px; font-weight: bold; color: #007bff; letter-spacing: 4px; font-family: Verdana, Geneva, Tahoma, sans-serif;">10897997</p>     
  //           <p style="font-size: 10px; color: grey;">This code can be used only once and is valid for 24 hours.</p>            
  //       </div>`
};


function sendMail(mailOptions) {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        reject(error);
      } else {
        console.log('ok');
        resolve({ msg: 'Email Sent', info: info.response});
      }
    })
  });
}

// console.log('node mailer');
// sendMail(mailOptions);

module.exports = sendMail;
