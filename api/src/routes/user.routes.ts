import { Router } from "express";
import { z } from "zod";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { User } from "../models/User";

const router = Router();

router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await User.findById(req.user!.userId).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ user });
});

const onboardingSchema = z.object({
  studyWindow: z.object({
    start: z.string().regex(/^\d{2}:\d{2}$/),
    end: z.string().regex(/^\d{2}:\d{2}$/)
  }),
  preferredDays: z.array(z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])).min(1),
  remindersEnabled: z.boolean().optional()
});

router.put("/me/onboarding", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = onboardingSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid onboarding data", errors: parsed.error.flatten() });

  const updates = {
    "preferences.studyWindow": parsed.data.studyWindow,
    "preferences.preferredDays": parsed.data.preferredDays,
    ...(parsed.data.remindersEnabled !== undefined ? { "preferences.remindersEnabled": parsed.data.remindersEnabled } : {}),
    onboardingComplete: true
  };

  const user = await User.findByIdAndUpdate(req.user!.userId, updates, { new: true }).select("-passwordHash");
  return res.json({ user });
});

export default router;