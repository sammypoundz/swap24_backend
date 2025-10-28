import { Request, Response } from "express";
import UserProfile from "../models/user_profile";
import Offer from "../models/offer";
import { v4 as uuidv4 } from "uuid";

// ✅ Fetch all transactions for a user
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const profile = await UserProfile.findOne({ userId }).select("transactions");

    if (!profile) {
      return res.status(404).json({ message: "User profile not found" });
    }

    res.json({ transactions: profile.transactions });
  } catch (err) {
    console.error("❌ Error fetching transactions:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Add a new transaction for a user (with Socket.IO event)
export const addTransaction = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      type,
      asset,
      amount,
      valueInNaira,
      status,
      txHash,
      transactionDescription,
    } = req.body;

    if (!userId || !type || !asset || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newTransaction = {
      type,
      asset,
      amount,
      valueInNaira: valueInNaira || 0,
      status: status || "pending",
      txHash: txHash || null,
      date: new Date(),
      transactionDescription: transactionDescription || "",
    };

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { $push: { transactions: newTransaction } },
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const io = req.app.get("io");
    io.to(userId.toString()).emit("newTransaction", newTransaction);

    return res.json({
      message: "✅ Transaction added successfully",
      transaction: newTransaction,
    });
  } catch (error) {
    console.error("❌ Error adding transaction:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// ✅ Record an ad/offer after blockchain confirmation
export const recordAdAfterContract = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      adsId, // ✅ Blockchain ad ID
      title,
      description,
      assetType,
      pricePerUnit,
      availableAmount,
      minLimit,
      maxLimit,
      paymentMethods,
      txHash,
    } = req.body;

    // Validate essential fields
    if (!userId || !adsId || !assetType || !pricePerUnit || !availableAmount) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // ✅ Create new offer
    const newOffer = new Offer({
      userId,
      adsId, // ✅ Save blockchain ad ID
      title: title || `${assetType} Offer`,
      description: description || "",
      assetType,
      pricePerUnit,
      availableAmount,
      minLimit: minLimit || 0,
      maxLimit: maxLimit || 0,
      paymentMethods: paymentMethods || [],
      status: "active",
    });

    await newOffer.save();

    // ✅ Log as transaction under user profile
    const transactionRecord = {
      type: "Offer Creation",
      asset: assetType,
      amount: availableAmount,
      valueInNaira: pricePerUnit * availableAmount,
      status: "completed",
      txHash: txHash || null,
      date: new Date(),
      transactionDescription: `Posted ${assetType} offer on blockchain (Ad ID: ${adsId}).`,
    };

    await UserProfile.findOneAndUpdate(
      { userId },
      { $push: { transactions: transactionRecord } },
      { new: true }
    );

    // ✅ Emit socket event to user's room
    const io = req.app.get("io");
    io.to(userId.toString()).emit("newTransaction", transactionRecord);

    return res.json({
      success: true,
      message: "✅ Offer recorded successfully after blockchain post",
      offer: newOffer,
      transaction: transactionRecord,
    });
  } catch (error) {
    console.error("❌ Error recording ad after contract:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
