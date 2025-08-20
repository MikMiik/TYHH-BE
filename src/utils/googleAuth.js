const OAuth2Client = require("google-auth-library").OAuth2Client;
const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  "your-google-client-id.apps.googleusercontent.com";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    console.log(ticket);

    return ticket.getPayload();
  } catch (err) {
    return null;
  }
}

module.exports = verifyGoogleToken;
