import express from "express";
import { getAllOffersWithSeller } from "../controllers/offerController";

const router = express.Router();

// ✅ Test route
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "✅ Offer API test route working!",
    note: "If you can see this, your backend and CORS are configured correctly.",
  });
});

router.get("/", getAllOffersWithSeller);

export default router;
