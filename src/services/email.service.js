const nodemailer = require('nodemailer');
const config = require('../config/email');

const createTransport = () => {
  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    auth: {
      user: config.smtp.auth.user,
      pass: config.smtp.auth.pass
    }
  });
};

const transport = createTransport();

const sendEmail = async (to, subject, html) => {
  const msg = {
    from: config.from,
    to,
    subject,
    html
  };
  await transport.sendMail(msg);
};

module.exports = {
  sendEmail
};