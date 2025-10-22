import mongoose, { Document, Schema } from "mongoose";

export type TransactionType =
  | "deposit"
  | "withdrawal"
  | "swap"
  | "purchase"
  | "transfer"
  | "adPlacement"; // ✅ NEW TYPE ADDED

export interface ITransaction {
  type: TransactionType; // use the type alias instead
  asset: string; // e.g., BTC, ETH, USDT
  amount: number;
  valueInNaira?: number;
  status: "pending" | "completed" | "failed";
  txHash?: string;
  date: Date;
  transactionDescription?: string;
}

export interface IUserProfile extends Document {
  userId: mongoose.Types.ObjectId;
  username?: string;
  bio?: string;
  profilePicture?: string;
  walletAddress?: string;

  balance?: {
    naira: number;
    crypto: Record<string, number>;
  };

  transactions: ITransaction[];
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  type: {
    type: String,
    required: true,
    enum: [
      "deposit",
      "withdrawal",
      "swap",
      "purchase",
      "transfer",
      "adPlacement", // ✅ properly added to enum
    ],
  },
  asset: { type: String, required: true },
  amount: { type: Number, required: true },
  valueInNaira: { type: Number, default: 0 },
  status: {
    type: String,
    required: true,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  txHash: { type: String, default: null },
  date: { type: Date, default: Date.now },
  transactionDescription: { type: String, default: "" },
});

const userProfileSchema = new Schema<IUserProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, default: null },
    bio: { type: String, default: null },
    profilePicture: { type: String, default: null },
    walletAddress: { type: String, default: null },

    balance: {
      naira: { type: Number, default: 0 },
      crypto: { type: Map, of: Number, default: {} },
    },

    transactions: [transactionSchema],
  },
  { timestamps: true }
);

export default mongoose.model<IUserProfile>("UserProfile", userProfileSchema);
