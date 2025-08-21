const nodemailer = require("nodemailer");
const mail = require("@/configs/mail");

const transporter = nodemailer.createTransport({
  service: mail.SERVICE,
  auth: {
    user: mail.AUTH_USER,
    pass: mail.AUTH_PASS,
  },
});

module.exports = transporter;
