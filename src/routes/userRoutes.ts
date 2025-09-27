// src/routes/userRoutes.ts
import { Router, Request, Response } from "express";
import User, { IUser } from "../models/User";

const router: Router = Router();

// Create user
router.post("/", async (req: Request, res: Response) => {
  try {
    const user: IUser = new User(req.body);
    await user.save();
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get all users
router.get("/", async (req: Request, res: Response) => {
  const users = await User.find();
  res.json(users);
});

export default router;
