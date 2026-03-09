import { Router } from "express";
import { z } from "zod";
import { Task } from "../models/Tasks";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  deadline: z.string().optional(),
});

router.post("/tasks", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = createTaskSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid task data",
      errors: parsed.error.flatten(),
    });
  }

  const { title, description, priority, deadline } = parsed.data;

  const task = await Task.create({
    userId: req.user!.userId,
    title,
    description: description || "",
    priority: priority || "medium",
    deadline: deadline ? new Date(deadline) : null,
  });

  res.status(201).json({ task });
});

router.get("/tasks", requireAuth, async (req: AuthedRequest, res) => {
  const tasks = await Task.find({ userId: req.user!.userId, status: "todo" })
    .sort({ deadline: 1, createdAt: -1 });

  res.json({ tasks });
});

router.patch("/tasks/:taskId", requireAuth, async (req: AuthedRequest, res) => {
  const { taskId } = req.params;
  const updates = req.body;

  const task = await Task.findOneAndUpdate(
    { _id: taskId, userId: req.user!.userId },
    updates,
    { new: true }
  );

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  res.json({ task });
});

router.delete("/tasks/:taskId", requireAuth, async (req: AuthedRequest, res) => {
  const { taskId } = req.params;

  const deleted = await Task.findOneAndDelete({
    _id: taskId,
    userId: req.user!.userId,
  });

  if (!deleted) {
    return res.status(404).json({ message: "Task not found" });
  }

  res.json({ message: "Task deleted" });
});

export default router;