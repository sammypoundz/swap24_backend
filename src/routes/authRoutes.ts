import { Router } from "express";
import { 
  register, 
  verifyOtp, 
  resendOtp, 
  sendOtpPhone, 
  verifyPhoneOtp, 
  resendPhoneOtp, 
  signin, 
  logout 
} from "../controllers/authController";

const router = Router();

// Email OTP
router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

// Phone OTP
router.post("/send-otp-phone", sendOtpPhone);
router.post("/verify-otp-phone", verifyPhoneOtp);
router.post("/resend-otp-phone", resendPhoneOtp);

// Auth
router.post("/signin", signin);
router.post("/logout", logout);

export default router;
