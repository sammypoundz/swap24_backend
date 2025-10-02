import mongoose, { Document, Schema } from "mongoose";

export interface ITransaction {
  type: "deposit" | "withdrawal" | "swap" | "purchase" | "transfer"; // transaction types
  asset: string;                // e.g., BTC, ETH, USDT
  amount: number;               // numeric amount
  valueInNaira?: number;        // optional conversion value
  status: "pending" | "completed" | "failed";
  txHash?: string;              // blockchain transaction hash if available
  date: Date;                   // timestamp
  transactionDescription?: string; // 👈 NEW FIELD
}

export interface IUserProfile extends Document {
  userId: mongoose.Types.ObjectId; // reference to User
  username?: string;               // optional display name
  bio?: string;                    // short bio/description
  profilePicture?: string;         // avatar URL
  walletAddress?: string;          // connected wallet

  balance?: {
    naira: number;
    crypto: Record<string, number>; // e.g., { BTC: 0.5, ETH: 1.2 }
  };

  transactions: ITransaction[];    // all transaction history
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  type: { type: String, required: true, enum: ["deposit", "withdrawal", "swap", "purchase", "transfer"] },
  asset: { type: String, required: true },
  amount: { type: Number, required: true },
  valueInNaira: { type: Number, default: 0 },
  status: { type: String, required: true, enum: ["pending", "completed", "failed"], default: "pending" },
  txHash: { type: String, default: null },
  date: { type: Date, default: Date.now },
  transactionDescription: { type: String, default: "" }, // 👈 NEW FIELD
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
      crypto: { type: Map, of: Number, default: {} }, // dynamic crypto balances
    },

    transactions: [transactionSchema],
  },
  { timestamps: true }
);

export default mongoose.model<IUserProfile>("UserProfile", userProfileSchema);
