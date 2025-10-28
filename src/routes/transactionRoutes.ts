// routes/transactionRoutes.ts
import { Router } from "express";
import {
  getTransactions,
  addTransaction,
  recordAdAfterContract
} from "../controllers/transactionController";


const router = Router();

// ✅ Add new transaction
// POST /api/transactions/add
router.post("/add", addTransaction);

// ✅ Get all transactions for a user
// GET /api/transactions/:userId
router.get("/:userId", getTransactions);

router.post("/recordAdAfterContract", recordAdAfterContract);

export default router;
