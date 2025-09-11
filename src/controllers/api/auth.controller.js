const usersService = require("@/services/user.service");
const authService = require("@/services/auth.service");
const {
  verifyMailToken,
  generateAccessToken,
} = require("@/services/jwt.service");
const { hashPassword } = require("@/utils/bcrytp");

exports.login = async (req, res) => {
  try {
    const data = (({ email, password, rememberMe }) => ({
      email,
      password,
      rememberMe,
    }))(req.body);
    const tokenData = await authService.login(data);
    res.success(200, tokenData);
  } catch (error) {
    res.error(401, error.message);
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.error(401, "No token provided");
    }
    const userData = await authService.googleLogin(token);
    res.success(200, userData);
  } catch (error) {
    res.error(401, error.message);
  }
};

exports.register = async (req, res) => {
  let { confirmPassword, ...data } = req.body;
  const result = await authService.register(data);
  res.success(201, result);
};

exports.changeEmail = async (req, res) => {
  try {
    const { userId } = req.user;
    const { newEmail } = req.body;
    const updatedUser = await authService.changeEmail({ userId, newEmail });
    res.success(200, updatedUser);
  } catch (error) {
    res.error(400, error.message);
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(userId, {
      currentPassword,
      newPassword,
    });
    res.success(200, result);
  } catch (error) {
    res.error(401, error.message);
  }
};

exports.me = async (req, res) => {
  try {
    const accessToken = req.headers?.authorization?.replace("Bearer ", "");
    const { userId } = await authService.checkUser(accessToken);
    const user = await usersService.getMe(userId);
    res.success(200, user);
  } catch (error) {
    res.error(401, error.message);
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const tokenData = await authService.refreshAccessToken(
      req.body.refreshToken
    );
    res.success(200, tokenData);
  } catch (error) {
    res.error(403, error.message);
  }
};

exports.logout = async (req, res) => {
  try {
    const result = await authService.logout(req.body.refreshToken);
    res.success(200, result);
  } catch (error) {
    res.error(401, error.message);
  }
};

exports.sendForgotEmail = async (req, res) => {
  try {
    const result = await authService.sendForgotEmail(req.body.email);
    res.success(200, result);
  } catch (error) {
    res.error(500, error.message);
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const { userId } = verifyMailToken(token);
    await usersService.update(userId, {
      verifiedAt: new Date(),
    });
    const { accessToken } = generateAccessToken(userId);
    return res.success(200, { accessToken });
  } catch (error) {
    res.error(500, error.message);
  }
};

exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.query;
    const { userId } = verifyMailToken(token);
    res.success(200, { userId });
  } catch (error) {
    res.error(401, error.message);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { userId } = verifyMailToken(token);
    const password = await hashPassword(req.body.password);
    const result = await usersService.update(userId, { password });
    res.success(200, { message: "Reset password successfully" });
  } catch (error) {
    res.error(401, error.message);
  }
};

exports.checkKey = async (req, res) => {
  try {
    const { key } = req.body;
    const userId = req.userId; // Từ middleware checkAuth

    if (!key) {
      return res.error(400, "Key is required");
    }

    const result = await authService.checkKey(userId, key);
    res.success(200, result);
  } catch (error) {
    res.error(400, error.message);
  }
};
