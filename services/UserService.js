const bcrypt = require("bcrypt");
const { User } = require("../models");
const jwtUtils = require("../helpers/jwt");

// Logic for user registration
async function registerUser(data) {
  try {
    const { email, password, studentCode, teacherCode } = data;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error(`Invalid email format: ${email}`);
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error("Email already exists");
    }

    if (studentCode) {
      const existingStudentCode = await User.findOne({
        where: { studentCode },
      });
      if (existingStudentCode) {
        throw new Error("Student code already exists");
      }
    }

    if (teacherCode) {
      const existingTeacherCode = await User.findOne({
        where: { teacherCode },
      });
      if (existingTeacherCode) {
        throw new Error("Teacher code already exists");
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      ...data,
      password: hashedPassword,
    });
    await newUser.save();

    const { password: _, ...userWithoutPassword } = newUser.toJSON();

    return {
      status: 200,
      message: "Register Successfully",
      data: userWithoutPassword,
    };
  } catch (error) {
    throw new Error(`Registration failed: ${error.message}`);
  }
}

// Logic for user login
async function loginUser(email, password) {
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate new access token and refresh token
    const accessToken = await jwtUtils.generateJwtAccess(user);
    const refreshToken = await jwtUtils.generateJwtRefresh(user);

    return {
      status: 200,
      message: "Login Successfully",
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    };
  } catch (error) {
    throw new Error(`Login failed: ${error.message}`);
  }
}

module.exports = {
  registerUser,
  loginUser,
};
