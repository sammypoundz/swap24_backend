import { Request, Response } from "express";
import UserProfile from "../models/user_profile";

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
      transactionDescription, // 👈 added
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
      transactionDescription: transactionDescription || "", // 👈 safe default
    };

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { $push: { transactions: newTransaction } },
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    // ✅ Emit socket event only to this user's room
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
