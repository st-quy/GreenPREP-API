const bcrypt = require("bcrypt");
const { User } = require("../models");
const jwtUtils = require("../helpers/jwt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

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

async function getUserById(userId) {
  try {
    const user = await User.findOne({ where: { ID: userId } });
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw new Error(`Error fetching user: ${error.message}`);
  }
}

async function updateUser(userId, data) {
  try {
    const user = await User.findOne({ where: { ID: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    await user.update(data);
    return {
      status: 200,
      message: "User updated successfully",
      data: user,
    };
  } catch (error) {
    throw new Error(`Error updating user: ${error.message}`);
  }
}

async function changePassword(userId, oldPassword, newPassword) {
  try {
    const user = await User.findOne({ where: { ID: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid old password");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedNewPassword });

    return {
      status: 200,
      message: "Password changed successfully",
    };
  } catch (error) {
    throw new Error(`Error changing password: ${error.message}`);
  }
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendResetPasswordEmail(email) {
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("User with this email does not exist");
    }

    const newPassword = crypto.randomBytes(4).toString("hex");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "🔑 Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
          <h2 style="color: #333;">🔑 Password Reset</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Your new password is: <strong style="color: #d9534f;">${newPassword}</strong></p>
          <p>Please log in and change your password immediately.</p>
          <p style="color: #777; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return { status: 200, message: "New password sent to your email" };
  } catch (error) {
    throw new Error(`Error sending reset password email: ${error.message}`);
  }
}

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  updateUser,
  changePassword,
  sendResetPasswordEmail
};
