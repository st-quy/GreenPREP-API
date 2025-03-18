const userService = require("../services/UserService");

const registerUser = async (req, res) => {
  try {
    const result = await userService.registerUser(req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(400).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await userService.loginUser(email, password);
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
