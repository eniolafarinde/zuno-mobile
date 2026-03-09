import { api } from "./client";

export type TaskPriority = "high" | "medium" | "low";
export type TaskSize = "small" | "medium" | "large";

export type Task = {
  _id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  deadline?: string | null;
  status: "todo" | "completed" | "overdue";
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function createTask(payload: {
  title: string;
  description?: string;
  priority?: TaskPriority;
  deadline?: string;
}) {
  const res = await api.post("/tasks", payload);
  return res.data.task as Task;
}

export async function getTasks() {
  const res = await api.get("/tasks");
  return res.data.tasks as Task[];
}

export async function updateTask(
  taskId: string,
  updates: Partial<Task>
) {
  const res = await api.patch(`/tasks/${taskId}`, updates);
  return res.data.task as Task;
}

export async function deleteTask(taskId: string) {
  await api.delete(`/tasks/${taskId}`);
}