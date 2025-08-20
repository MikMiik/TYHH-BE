const { hashPassword, comparePassword } = require("@/utils/bcrytp");
const { verifyAccessToken, generateMailToken } = require("./jwt.service");
const {
  findValidRefreshToken,
  deleteRefreshToken,
} = require("./refreshToken.service");
const sendUnverifiedUserEmail = require("@/utils/sendUnverifiedUserEmail");
const buildTokenResponse = require("@/utils/buildTokenResponse");
const generateClientUrl = require("@/utils/generateClientUrl");
const userService = require("./user.service");
const queue = require("@/utils/queue");
const settingService = require("./setting.service");
const { User } = require("@/models");
const axios = require("axios");

const register = async (data) => {
  const user = await userService.create({
    ...data,
    password: await hashPassword(data.password),
  });

  sendUnverifiedUserEmail(user.id);
  settingService.createDefaultSettings(user.id);
  return {
    message:
      "Registration successful. Please check your email to verify your account.",
  };
};

const login = async (data) => {
  try {
    const { email, rememberMe } = data;
    const user = await userService.getByEmail(email);
    const result = await buildTokenResponse({ userId: user.id, rememberMe });
    await userService.update(user.id, { lastLogin: new Date() });
    return result;
  } catch (err) {
    throw new Error("Failed to generate authentication tokens.");
  }
};

const checkUser = async (accessToken) => {
  return verifyAccessToken(accessToken);
};

const refreshAccessToken = async (refreshTokenString) => {
  const refreshToken = await findValidRefreshToken(refreshTokenString);
  try {
    const result = await buildTokenResponse({
      userId: refreshToken.userId,
      rememberMe: null,
      hasRefreshToken: true,
    });
    await deleteRefreshToken(refreshToken.token);
    return result;
  } catch (err) {
    throw new Error("Failed to generate authentication tokens.");
  }
};

const logout = async (refreshToken) => {
  await deleteRefreshToken(refreshToken);
  return {
    message: "Logout successfully",
  };
};

const sendForgotEmail = async (email) => {
  try {
    const user = await userService.getByEmail(email);
    if (user) {
      const tokenData = generateMailToken(user.id);
      const resetPasswordUrl = generateClientUrl("reset-password", {
        token: tokenData.token,
      });

      queue.dispatch("sendForgotPasswordEmailJob", {
        userId: user.id,
        email: user.email,
        token: tokenData.token,
        resetPasswordUrl,
      });
    }
    return {
      message:
        "If your email exists in our system, a password reset link has been sent.",
    };
  } catch (error) {
    throw new Error(
      "Failed to send password reset email. Please try again later."
    );
  }
};

const changeEmail = async ({ userId, newEmail }) => {
  const user = await userService.getById(userId);
  if (!user) {
    throw new Error("User not found.");
  }
  const updatedUser = await userService.update(userId, {
    email: newEmail,
    verifiedAt: null,
  });
  sendUnverifiedUserEmail(userId);
  return updatedUser;
};

const changePassword = async (userId, data) => {
  const user = await User.findOne({
    where: { id: userId },
    hooks: false,
    attributes: ["password"],
  });

  if (!user) {
    throw new Error("User not found.");
  }

  if (!data.currentPassword) {
    throw new Error("Current password is required");
  }

  if (!user.password) {
    throw new Error("User stored password not found");
  }

  const isPasswordMatch = await comparePassword(
    data.currentPassword,
    user.password
  );

  if (!isPasswordMatch) {
    throw new Error("Current password is incorrect");
  }

  const updatedUser = await userService.update(userId, {
    password: await hashPassword(data.newPassword),
  });
  return updatedUser;
};

const googleLogin = async (token) => {
  try {
    const { data } = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (data && data.email_verified) {
      const user = await userService.getByEmail(data.email);
      if (!user) {
        const newUser = await userService.create({
          email: data.email,
          firstName: data.given_name,
          lastName: data.family_name,
          avatar: data.picture,
          googleId: data.sub,
          verifiedAt: new Date(),
        });
        settingService.createDefaultSettings(newUser.id);
        return buildTokenResponse({ userId: newUser.id, rememberMe: true });
      }
      const result = await buildTokenResponse({
        userId: user.id,
        rememberMe: true,
      });
      await userService.update(user.id, { lastLogin: new Date() });
      return result;
    }
  } catch (error) {
    console.error("Error check tokens", error);
    return null;
  }
};

const githubLogin = async (code) => {
  try {
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: "application/json" },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) return null;

    // Dùng token gọi API lấy user info
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userData = userResponse.data;
    if (userData) {
      const user = await userService.getByEmail(userData.email);
      if (!user) {
        const newUser = await userService.create({
          email: userData.email || null,
          firstName: userData.name.split(/\s+/)[0] || "",
          lastName: userData.name.split(/\s+/).slice(1).join(" ") || "",
          avatar: userData.avatar_url,
          githubId: userData.id,
          address: userData.location || "",
          verifiedAt: new Date(),
        });
        settingService.createDefaultSettings(newUser.id);
        return buildTokenResponse({ userId: newUser.id, rememberMe: true });
      }
      const result = await buildTokenResponse({
        userId: user.id,
        rememberMe: true,
      });
      await userService.update(user.id, { lastLogin: new Date() });
      return result;
    }
  } catch (error) {
    console.error(error.response?.data || error.message);
    return null;
  }
};

module.exports = {
  register,
  login,
  checkUser,
  refreshAccessToken,
  logout,
  sendForgotEmail,
  changeEmail,
  changePassword,
  googleLogin,
  githubLogin,
};
