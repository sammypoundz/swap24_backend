import mongoose, { Schema, Document } from "mongoose";

export interface ITraderStats extends Document {
  userId: string; // Reference to trader (User)
  totalOrders: number; // Total number of trades (buy/sell)
  successfulOrders: number; // Successfully completed trades
  cancelledOrders: number; // Cancelled trades
  positivityRate: number; // Success percentage
  averageReleaseTime: number; // In minutes
  averagePaymentTime: number; // In minutes
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountUsername: string;
  };
  updatedAt: Date;
}

const TraderStatsSchema = new Schema<ITraderStats>(
  {
    userId: { type: String, required: true, unique: true },

    totalOrders: { type: Number, default: 0 },
    successfulOrders: { type: Number, default: 0 },
    cancelledOrders: { type: Number, default: 0 },

    // 🧮 Positivity Rate = (successfulOrders / totalOrders) * 100
    positivityRate: { type: Number, default: 0 },

    // ⏱️ Average time in minutes
    averageReleaseTime: { type: Number, default: 0 },
    averagePaymentTime: { type: Number, default: 0 },

    // 🏦 Bank info for payments
    bankDetails: {
      bankName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      accountUsername: { type: String, required: true },
    },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

// ✅ Auto-calculate positivity rate before saving
TraderStatsSchema.pre("save", function (next) {
  if (this.totalOrders > 0) {
    this.positivityRate = Number(
      ((this.successfulOrders / this.totalOrders) * 100).toFixed(2)
    );
  } else {
    this.positivityRate = 0;
  }
  next();
});

export default mongoose.model<ITraderStats>("TraderStats", TraderStatsSchema);
