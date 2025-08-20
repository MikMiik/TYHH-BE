const bcrypt = require("bcrypt");
const hashPassword = async (password) => {
  const saltRounds = 10;
  try {
    const hashed = await bcrypt.hash(password, saltRounds);
    return hashed;
  } catch (error) {
    console.error(error);
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
