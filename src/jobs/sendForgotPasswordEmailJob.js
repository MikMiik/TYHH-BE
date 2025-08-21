const transporter = require("@/configs/mailer");
const loadMail = require("@/utils/loadEmail");
const mail = require("@/configs/mail");

async function sendForgotPasswordEmailJob(job) {
  const data = JSON.parse(job.payload);
  const template = await loadMail("forgotpassword", data);

  const message = {
    from: mail.SENDER_FROM,
    to: data.email,
    subject: "Forgot Password Message",
    html: template,
  };
  await transporter.sendMail(message);
}

module.exports = sendForgotPasswordEmailJob;
