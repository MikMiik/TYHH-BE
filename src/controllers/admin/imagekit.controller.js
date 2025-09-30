const ImageKit = require("imagekit");

// Initialize ImageKit instance
const imagekit = new ImageKit({
  urlEndpoint: process.env.IK_URL_ENDPOINT,
  publicKey: process.env.IK_PUBLIC_KEY,
  privateKey: process.env.IK_PRIVATE_KEY,
});

exports.getAuth = async (req, res) => {
  const { token, expire, signature } = imagekit.getAuthenticationParameters();
  res.success(200, {
    token,
    expire,
    signature,
    publicKey: process.env.IK_PUBLIC_KEY,
  });
};
