import express from "express";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
// import type { Abi } from "viem";
import Swap24MarketAbi from "../Swap24MarketAbi.json";

const router = express.Router();

// ------------------- VIEM SETUP -------------------

// Ensure proper type for contract address
const contractAddress = process.env.CONTRACT_ADDRESS as `0x${string}`;

// Public client (read-only)
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.RPC_URL!),
});

// ------------------- ROUTES ------------------- //

// Serve contract info (ABI & address) to frontend
router.get("/contract-info", (req, res) => {
  res.json({
    address: contractAddress,
    abi: Swap24MarketAbi,
  });
});

// Log user transaction after frontend sends it
router.post("/ads/log-tx", async (req, res) => {
  try {
    const { txHash, userAddress, cryptoToken, tokenAmount, priceInNaira, paymentMethod, rate } = req.body;

    if (!txHash || !userAddress) {
      return res.status(400).json({ success: false, error: "txHash and userAddress are required" });
    }

    // TODO: store ad info in your database
    // await AdModel.create({ userAddress, cryptoToken, tokenAmount, priceInNaira, paymentMethod, rate, txHash });

    res.json({ success: true, message: "Ad logged successfully" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Read all ads from contract
router.get("/ads", async (req, res) => {
  try {
    const ads = await publicClient.readContract({
      address: contractAddress,
      abi: Swap24MarketAbi,
      functionName: "getAllAds",
    });

    res.json(ads);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Read single ad from contract
router.get("/ads/:id", async (req, res) => {
  try {
    const adId = BigInt(req.params.id);

    const ad = await publicClient.readContract({
      address: contractAddress,
      abi: Swap24MarketAbi,
      functionName: "getAd",
      args: [adId],
    });

    res.json(ad);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
