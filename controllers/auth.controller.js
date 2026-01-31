import User from "../modals/UserModal.js";
import response from "../utils/responseHandler.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendResetPasswordLinkToEmail } from "../config/emailConfiguration.js";
import dotenv from "dotenv";
dotenv.config();

export const register = async (req, res) => {
  try {
    const { email, name, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return response(res, 400, "User already exist");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();
    return response(res, 200, "User registered successfully", {
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal server error", {
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return response(res, 400, "Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return response(res, 400, "Invalid password");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    return response(res, 200, "Login successful", {
      accessToken,
      refreshToken,
      role: user.role,
      name: user.name,
      email: user.email,
      _id: user._id,
      phone: user.phone,
      imageUrl: user.imageUrl,
    });
  } catch (error) {
    return response(res, 500, "Internal Server Error", error.message);
  }
};

export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return response(res, 401, "Unauthorized: refresh token required");
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    if (!decoded?.userId) {
      return response(res, 401, "Invalid token payload");
    }

    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET, 
      { expiresIn: "15m" }
    );

    return response(res, 200, "Token refreshed successfully", { accessToken: newAccessToken });
  } catch (error) {
    return response(res, 401, "Invalid or expired refresh token");
  }
};


export const logout = async (req, res) => {
  try {
    return response(res, 200, "Logout successfully");
  } catch (error) {
    return response(res, 500, "Internal Server Error", error.message);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return response(res, 400, "No Account Found with this email");
    }

    const resetPasswordToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);

    await user.save();

    try {
      await sendResetPasswordLinkToEmail(email, resetPasswordToken);
      return response(
        res,
        200,
        "A password reset link has been sent to your email address",
        process.env.NODE_ENV === "development"
          ? { resetToken: resetPasswordToken }
          : null
      );
    } catch (emailError) {
      console.error("Email sending failed:", emailError);

      // For testing purposes, return the token even if email fails
      // if (process.env.NODE_ENV === "development") {
      //   return response(
      //     res,
      //     200,
      //     "Email service failed, but here's your reset token for testing",
      //     {
      //       resetToken: resetPasswordToken,
      //       resetUrl: `${process.env.FRONTEND_URL}/reset-password/${resetPasswordToken}`,
      //       expiresAt: user.resetPasswordExpires,
      //     }
      //   );
      // }
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      return response(
        res,
        500,
        "Failed to send password reset email. Please try again later.",
        { error: "Email service temporarily unavailable" }
      );
    }
  } catch (error) {
    return response(res, 500, "Internal server error", error.message);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    console.log("Request body is getting printed", req.body);

    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return response(res, 400, "Password does not match");
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return response(
        res,
        400,
        "Invalid or expiry reset password token present"
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return response(
      res,
      200,
      "Your password has been reset successfully. You can now log in with your new password."
    );
  } catch (error) {
    return response(res, 500, "Internal server error", error.message);
  }
};

export const checkAuth = async (req, res) => {
  try {
    const userId = req?.id;
    if (!userId) {
      return response(
        res,
        400,
        "Unauthorized, please login to access our page"
      );
    }
    const user = await User.findById(userId).select(
      "name email imageUrl phone role"
    );
    return response(res, 200, "User retrived successfully", user);
  } catch (error) {
    return response(res, 500, "Internal server error ", error.message);
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return response(res, 400, "Current password and new password are required");
    }

    if (newPassword.length < 6) {
      return response(res, 400, "New password must be at least 6 characters long");
    }

    // Find user with password
    const user = await User.findById(userId);
    if (!user) {
      return response(res, 404, "User not found");
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return response(res, 400, "Current password is incorrect");
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    return response(res, 200, "Password changed successfully");
  } catch (error) {
    console.error("Change password error:", error);
    return response(res, 500, "Internal server error", error.message);
  }
};