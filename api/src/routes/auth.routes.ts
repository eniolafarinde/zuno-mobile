import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { User } from "../models/User";
import { signAccessToken } from "../utils/jwt";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  timezone: z.string().optional()
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });

  const { email, password, name, timezone } = parsed.data;

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: "Email already in use" });

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    email,
    passwordHash,
    name: name || "",
    timezone: timezone || "America/Chicago"
  });

  const token = signAccessToken({ userId: user._id.toString() });

  return res.status(201).json({
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      onboardingComplete: user.onboardingComplete
    }
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

  const { email, password } = parsed.data;

  const user = await User.findOne({ email });
  if (!user?.passwordHash) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signAccessToken({ userId: user._id.toString() });

  return res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      onboardingComplete: user.onboardingComplete
    }
  });
});

export default router;