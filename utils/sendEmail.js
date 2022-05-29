const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //email transport configuration
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NODE_MAILER_EMAIL,
      pass: process.env.NODE_MAILER_PASSWORD,
    },
  });

  //Email message option
  const message = {
    from: process.env.NODE_MAILER_EMAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //send email
  transporter.sendMail(message, (error, info) => {
    if (error) {
      console.log('error occur', error);
    } else {
      console.log('Email send: ' + info.response);
    }
  });
};

module.exports = sendEmail;
