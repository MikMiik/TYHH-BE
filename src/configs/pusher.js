const Pusher = require("pusher");

const pusher = new Pusher({
  appId: process.env.PUSHER_APPID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  useTLS: false,
  cluster: process.env.PUSHER_CLUSTER,
  host: process.env.PUSHER_HOST,
  port: process.env.PUSHER_PORT,
});

module.exports = pusher;
