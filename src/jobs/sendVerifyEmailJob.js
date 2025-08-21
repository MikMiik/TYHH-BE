const transporter = require("@/configs/mailer");
const usersService = require("@/services/user.service");
const mail = require("@/configs/mail");
const loadMail = require("@/utils/loadEmail");

async function sendVerifyEmailJob(job) {
  const { userId, token, verifyUrl } = JSON.parse(job.payload);
  const user = await usersService.getById(userId);

  const template = await loadMail("verification", {
    token,
    userId: user.id,
    verifyUrl,
  });
  const message = {
    from: mail.SENDER_FROM,
    to: user.email,
    subject: "Verify Message",
    html: template,
  };
  await transporter.sendMail(message);
}

module.exports = sendVerifyEmailJob;
