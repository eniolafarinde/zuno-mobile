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

const pomodoroPreferencesSchema = z.object({
  focusMin: z.number().int().min(1).max(180).optional(),
  breakMin: z.number().int().min(1).max(60).optional(),
  longBreakMin: z.number().int().min(1).max(60).optional(),
  cyclesBeforeLongBreak: z.number().int().min(1).max(10).optional()
});

router.get("/me/pomodoro", requireAuth, async (req: AuthedRequest, res) => {
  const user = await User.findById(req.user!.userId).select("preferences.pomodoro");
  if (!user) return res.status(404).json({ message: "User not found" });

  return res.json({
    pomodoro: user.preferences?.pomodoro ?? {
      focusMin: 25,
      breakMin: 5,
      longBreakMin: 15,
      cyclesBeforeLongBreak: 4
    }
  });
});

router.put("/me/pomodoro", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = pomodoroPreferencesSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid pomodoro preferences",
      errors: parsed.error.flatten()
    });
  }

  const data = parsed.data;
  const updates: Record<string, unknown> = {};

  if (data.focusMin !== undefined) updates["preferences.pomodoro.focusMin"] = data.focusMin;
  if (data.breakMin !== undefined) updates["preferences.pomodoro.breakMin"] = data.breakMin;
  if (data.longBreakMin !== undefined) updates["preferences.pomodoro.longBreakMin"] = data.longBreakMin;
  if (data.cyclesBeforeLongBreak !== undefined) {
    updates["preferences.pomodoro.cyclesBeforeLongBreak"] = data.cyclesBeforeLongBreak;
  }

  const user = await User.findByIdAndUpdate(req.user!.userId, updates, {
    new: true
  }).select("preferences.pomodoro");

  if (!user) return res.status(404).json({ message: "User not found" });

  return res.json({ pomodoro: user.preferences?.pomodoro });
});

export default router;