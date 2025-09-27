import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  otp?: string | null;          // email OTP
  otpExpires?: Date | null;     // email OTP expiry
  verified: boolean;            // email verified
  phone?: string;               // user phone number
  phoneOtp?: string | null;     // phone OTP
  phoneOtpExpires?: Date | null;// phone OTP expiry
  phoneVerified: boolean;       // phone verified
}

const userSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Email OTP
  otp: { type: String, default: null },
  otpExpires: { type: Date, default: null },
  verified: { type: Boolean, default: false },

  // Phone OTP
  phone: { type: String, default: null },
  phoneOtp: { type: String, default: null },
  phoneOtpExpires: { type: Date, default: null },
  phoneVerified: { type: Boolean, default: false },
});

export default mongoose.model<IUser>("User", userSchema);
