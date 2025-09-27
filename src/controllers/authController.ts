import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// ✅ generate random 4-digit OTP
const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

// ✅ helper: send OTP email
const sendOtpEmail = async (email: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Swap24" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
  });
};

// ========== REGISTER ==========
export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      otp,
      otpExpires: new Date(Date.now() + 5 * 60 * 1000),
    });

    await user.save();
    await sendOtpEmail(email, otp);

    res.status(201).json({ message: "User registered. OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ========== VERIFY EMAIL OTP ==========
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpires && user.otpExpires < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.otp = null;
    user.otpExpires = null;
    user.verified = true;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ========== RESEND EMAIL OTP ==========
export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendOtpEmail(email, otp);

    res.json({ message: "New OTP has been sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ========== SEND PHONE OTP ==========
export const sendOtpPhone = async (req: Request, res: Response) => {
  try {
    const { phone, email } = req.body;
    if (!phone || !email)
      return res.status(400).json({ message: "Phone and email are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOtp();
    user.phone = phone;
    user.phoneOtp = otp;
    user.phoneOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    // ✅ Instead of sending via Termii, log OTP to console
    console.log(`Generated OTP for phone ${phone}: ${otp}`);

    res.json({ message: "OTP generated (check console log)" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate phone OTP" });
  }
};

// ========== VERIFY PHONE OTP ==========
export const verifyPhoneOtp = async (req: Request, res: Response) => {
  try {
    const { email, phone, otp } = req.body;
    if (!email || !phone || !otp) {
      return res.status(400).json({ message: "Email, phone, and OTP are required" });
    }

    const user = await User.findOne({ email, phone });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.phoneOtp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (user.phoneOtpExpires && user.phoneOtpExpires < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.phoneOtp = null;
    user.phoneOtpExpires = null;
    user.phoneVerified = true;
    await user.save();

    res.json({ message: "Phone number verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};


// ========== RESEND PHONE OTP ==========
export const resendPhoneOtp = async (req: Request, res: Response) => {
  try {
    const { email, phone } = req.body;
    if (!email || !phone) {
      return res.status(400).json({ message: "Email and phone are required" });
    }

    const user = await User.findOne({ email, phone });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOtp();
    user.phoneOtp = otp;
    user.phoneOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    // ✅ Instead of sending SMS, log OTP in console for now
    console.log(`Resent OTP for phone ${phone}: ${otp}`);

    res.json({ message: "New OTP generated (check console log)" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to resend phone OTP" });
  }
};


// ========== SIGNIN ==========
export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.verified) {
      return res.status(400).json({ message: "Please verify your email first" });
    }
    if (!user.phoneVerified) {
      return res.status(400).json({ message: "Please verify your phone number first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.json({ message: "Signin successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ========== LOGOUT ==========
export const logout = async (req: Request, res: Response) => {
  try {
    res.json({ message: "Logout successful. Please delete token on client." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
