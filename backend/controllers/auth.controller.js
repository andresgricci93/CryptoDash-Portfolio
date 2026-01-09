import { User } from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import { generateVerificationToken } from '../utils/generateVerificationToken.js';
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail } from '../mailtrap/emails.js';
import crypto from "crypto";

export const signup = async (req, res) => {

  if (process.env.REGISTRATION_ENABLED !== 'true') {
    return res.status(403).json({
      success: false,
      message: "Registration is currently closed"
    });
  }

  const { email, password, name } = req.body;

  try {

    if (!email || !password || !name) {
      throw new Error("All fields are required");
    }

    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }


    const hashedPassword = await bcryptjs.hash(password, 10);

    const verificationToken = generateVerificationToken();

    const user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    await user.save();

    // jwt 

    generateTokenAndSetCookie(res, user._id);

    await sendVerificationEmail(user.email, verificationToken);


    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        ...user._doc,
        password: undefined,
      }
    })

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export const verifyEmail = async (req, res) => {

  const { code } = req.body // when the user input the 6 digits code and press "enter" the code will be passed through the request.body
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification code" })
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });

  } catch (error) {
    console.error(`Error in verifyEmail:`, error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export const login = async (req, res) => {

  const { email, password } = req.body;
  try {

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid Credentials" });
    }
    const isPasswordValid = await bcryptjs.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Invalid Credentials" })
    }

    generateTokenAndSetCookie(res, user._id);
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });


  } catch (error) {
    console.log("Error in login", error);
    return res.status(400).json({ success: false, message: error.message })
  }
}


export const logout = async (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
  });

  res.status(200).json({ success: true, message: "Logged out successfully" });
}

export const forgotPassword = async (req, res) => {

  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    // Generate reset token 
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    // send email 
    await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);


    res.status(200).json({ success: true, message: "Password reset link sent to your email" });
  } catch (error) {
    console.log("Error in forgotPassword", error);
    res.status(400).json({ success: false, message: error.message });
  }
}

export const resetPassword = async (req, res) => {

  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }


    const hashedPassword = await bcryptjs.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.log("Error in resetPassword ", error);
    res.status(400).json({ success: false, message: error.message })
  }
}

export const checkAuth = async (req, res) => {
  try {

    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      res.status(400).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });

  } catch (error) {

  }
}

export const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }


    const hashedNewPassword = await bcryptjs.hash(newPassword, 10);


    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    console.log("Error in changePassword", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;


    await Note.deleteMany({ userId: userId });

    await User.findByIdAndDelete(userId);


    res.clearCookie("token");

    res.status(200).json({
      success: true,
      message: "Account and all associated data deleted successfully"
    });

  } catch (error) {
    console.log("Error in deleteAccount", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const verifyCurrentPassword = async (req, res) => {

  try {

    const { password } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User Not found" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    res.status(200).json({
      success: true,
      isValid: isPasswordValid
    })
  } catch (error) {
    console.log("Error in verifyCurrentPassword", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const validateMagicLink = async (req, res) => {
  try {
    const { token } = req.params;

    // Validate token against environment variable
    if (token !== process.env.DEMO_ACCESS_TOKEN) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token"
      });
    }

    // Find or create demo user
    let user = await User.findOne({ email: process.env.DEMO_USER_EMAIL });

    if (!user) {
      // Create demo user with random password
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const hashedPassword = await bcryptjs.hash(randomPassword, 10);

      user = new User({
        email: process.env.DEMO_USER_EMAIL,
        password: hashedPassword,
        name: "Demo User",
        isVerified: true
      });

      await user.save();
    }

    // Generate JWT cookie
    generateTokenAndSetCookie(res, user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Return user data without password
    res.status(200).json({
      success: true,
      message: "Magic link validated successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });

  } catch (error) {
    console.log("Error in validateMagicLink", error);
    res.status(400).json({ success: false, message: error.message });
  }
};