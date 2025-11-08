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
const { User, Role, UserRole, sequelize } = require("@/models");
const axios = require("axios");
const { default: slugify } = require("slugify");

const register = async (data) => {
  const t = await sequelize.transaction();
  try {
    const user = await userService.create(
      {
        ...data,
        password: await hashPassword(data.password),
      },
      { transaction: t }
    );

    // Automatically assign 'user' role to new user
    const userRole = await Role.findOne({
      where: { name: "user", isActive: true },
      transaction: t,
    });

    if (userRole) {
      await UserRole.create(
        {
          userId: user.id,
          roleId: userRole.id,
          isActive: true,
        },
        { transaction: t }
      );
    }

    await sendUnverifiedUserEmail(user.id, "login", t);
    await t.commit();
    return {
      message:
        "Registration successful. Please check your email to verify your account.",
    };
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

const login = async (data) => {
  try {
    const { email, rememberMe } = data;
    const user = await userService.getByEmail(email);

    // Check if user has any roles, if not assign default 'user' role
    const userWithRoles = await userService.getById(user.id);
    if (!userWithRoles.roles || userWithRoles.roles.length === 0) {
      const userRole = await Role.findOne({
        where: { name: "user", isActive: true },
      });

      if (userRole) {
        await UserRole.create({
          userId: user.id,
          roleId: userRole.id,
          isActive: true,
        });
      }
    }

    const result = await buildTokenResponse({ userId: user.id, rememberMe });
    await userService.update(user.id, { lastLogin: new Date() });
    return result;
  } catch (err) {
    throw new Error("Login failed");
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
  if (refreshToken) {
    await deleteRefreshToken(refreshToken);
  }
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
    return true;
  } catch (error) {
    throw new Error(
      "Failed to send password reset email. Please try again later."
    );
  }
};

const sendForgotAdminEmail = async (email) => {
  try {
    const user = await userService.getByEmail(email);
    const userRoles = await user.getRoles();
    if (user && userRoles && userRoles.some((role) => role.name === "admin")) {
      const tokenData = generateMailToken(user.id);
      const resetPasswordUrl = generateClientUrl(
        "reset-password",
        {
          token: tokenData.token,
        },
        process.env.ADMIN_URL
      );

      queue.dispatch("sendForgotPasswordEmailJob", {
        userId: user.id,
        email: user.email,
        token: tokenData.token,
        resetPasswordUrl,
      });
    }
    return true;
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
    newPassword: data.newPassword, // Pass as newPassword for user service to handle
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
        const t = await sequelize.transaction();

        try {
          const newUser = await userService.create(
            {
              email: data.email,
              name: data.name,
              username: slugify(data.name, { lower: true }),
              avatar: data.picture,
              googleId: data.sub,
              verifiedAt: new Date(),
            },
            { transaction: t }
          );

          // Automatically assign 'user' role to new Google user
          const userRole = await Role.findOne({
            where: { name: "user", isActive: true },
            transaction: t,
          });

          if (userRole) {
            await UserRole.create(
              {
                userId: newUser.id,
                roleId: userRole.id,
                isActive: true,
              },
              { transaction: t }
            );
          }

          await t.commit();
          return buildTokenResponse({ userId: newUser.id, rememberMe: true });
        } catch (error) {
          await t.rollback();
          throw error;
        }
      }

      // Check if existing user has roles, if not assign default 'user' role
      const userWithRoles = await userService.getById(user.id);
      if (!userWithRoles.roles || userWithRoles.roles.length === 0) {
        const userRole = await Role.findOne({
          where: { name: "user", isActive: true },
        });

        if (userRole) {
          await UserRole.create({
            userId: user.id,
            roleId: userRole.id,
            isActive: true,
          });
        }
      }

      const result = await buildTokenResponse({
        userId: user.id,
        rememberMe: true,
      });
      await userService.update(user.id, {
        lastLogin: new Date(),
        googleId: data.sub,
      });
      return result;
    }
  } catch (error) {
    console.error("Error check tokens", error);
    return null;
  }
};

const checkKey = async (userId, key) => {
  try {
    const user = await userService.getUserKey(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.activeKey) {
      throw new Error("Key already activated");
    }

    if (user.key !== key) {
      throw new Error("Invalid key");
    }

    // Activate user
    await userService.update(userId, {
      key: key,
      activeKey: true,
    });

    return {
      message: "Key activated successfully",
      activeKey: true,
    };
  } catch (error) {
    throw error;
  }
};

// Check if user is admin
const checkIsAdmin = (user) => {
  if (!user) return false;

  // Method 1: Role-based (preferred)
  if (user.roles?.some((role) => role.name === "admin")) return true;

  // Method 2: Legacy role field
  if (user.role === "admin") return true;

  // Method 3: Environment usernames
  const adminUsernames = process.env.ADMIN_USERNAMES?.split(",") || ["admin"];
  if (adminUsernames.includes(user.username)) return true;

  // Method 4: Email domain
  if (user.email?.endsWith(process.env.ADMIN_EMAIL_DOMAIN)) return true;

  return false;
};

module.exports = {
  register,
  login,
  checkUser,
  refreshAccessToken,
  logout,
  sendForgotEmail,
  sendForgotAdminEmail,
  changeEmail,
  changePassword,
  googleLogin,
  checkKey,
  checkIsAdmin,
};
