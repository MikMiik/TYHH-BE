const ejs = require("ejs");
const path = require("path");

async function loadMail(template, data = {}) {
  const emailPath = path.join(
    __dirname,
    "..",
    "views",
    "emails",
    `${template}.ejs`
  );
  const html = await ejs.renderFile(emailPath, data);
  return html;
}

module.exports = loadMail;
