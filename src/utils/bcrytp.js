const bcrypt = require("bcrypt");
const hashPassword = async (password) => {
  // Validate input
  if (!password || typeof password !== "string") {
    throw new Error("Password is required and must be a string");
  }

  const saltRounds = 10;
  try {
    const hashed = await bcrypt.hash(password, saltRounds);
    return hashed;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
};

const comparePassword = async (userPassword, storedPassword) => {
  try {
    const result = await bcrypt.compare(userPassword, storedPassword);
    return result;
  } catch (error) {
    console.error(error);
  }
};

module.exports = { hashPassword, comparePassword };
