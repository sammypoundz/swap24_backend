import mongoose, { Schema, Document } from "mongoose";

export interface IOffer extends Document {
  userId: string; // ID of user who created the offer
  adsId: string; // ID of the ad created on the blockchain
  title: string; // Title of the offer/ad
  description: string; // Detailed description
  assetType: string; // e.g., "USDT", "BTC", "ETH", etc.
  fiatCurrency?: string; // e.g., "NGN", "USD"
  pricePerUnit: number; // Price user sets per unit
  availableAmount: number; // How much is available
  minLimit?: number; // Optional minimum buy limit
  maxLimit?: number; // Optional maximum buy limit
  status: "active" | "completed" | "cancelled";
  paymentMethods: string[]; // e.g., ["Bank Transfer", "Opay"]
  tradeCount?: number; // Number of trades done on this offer
  completionRate?: number; // % completion rate of trades
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    userId: { type: String, required: true },
    adsId: { type: String, required: true, unique: true }, // Blockchain ad ID
    title: { type: String, required: true },
    description: { type: String, default: "" },
    assetType: { type: String, required: true },
    fiatCurrency: { type: String, default: "NGN" }, // Default to Naira
    pricePerUnit: { type: Number, required: true },
    availableAmount: { type: Number, required: true },
    minLimit: { type: Number, default: 0 },
    maxLimit: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    paymentMethods: [{ type: String }],
    tradeCount: { type: Number, default: 0 },
    completionRate: { type: Number, default: 100 }, // % of successful trades
  },
  { timestamps: true }
);

export default mongoose.model<IOffer>("Offer", OfferSchema);
