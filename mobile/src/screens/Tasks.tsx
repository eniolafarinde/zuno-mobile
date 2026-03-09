import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import AddTaskModal from "../components/AddTaskModal";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  Task,
} from "../api/tasks";

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  async function loadTasks() {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.log("Failed to load tasks", error);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleCreateTask(task: {
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    deadline?: string;
  }) {
    const newTask = await createTask(task);
    setTasks((prev) => [newTask, ...prev]);
  }

  async function handleComplete(task: Task) {
    const updated = await updateTask(task._id, {
      status: task.status === "completed" ? "todo" : "completed",
      completedAt: task.status === "completed" ? null : new Date().toISOString(),
    });

    setTasks((prev) =>
      prev.map((item) => (item._id === updated._id ? updated : item))
    );
  }

  async function handleDelete(taskId: string) {
    Alert.alert("Delete task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteTask(taskId);
          setTasks((prev) => prev.filter((item) => item._id !== taskId));
        },
      },
    ]);
  }

  function formatMeta(task: Task) {
    const parts = [
      `Priority: ${capitalize(task.priority)}`,
    ];

    if (task.deadline) {
      parts.push(`Due: ${new Date(task.deadline).toLocaleDateString()}`);
    }

    return parts.join("  •  ");
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Tasks</Text>
      <Text style={styles.subheading}>Plan what needs to get done.</Text>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <View>
            <View style={styles.taskRow}>
              <TouchableOpacity
                style={[
                  styles.completeCircle,
                  item.status === "completed" && styles.completeCircleFilled,
                ]}
                onPress={() => handleComplete(item)}
              >
                {item.status === "completed" && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </TouchableOpacity>

              <View style={styles.taskContent}>
                <Text
                  style={[
                    styles.taskTitle,
                    item.status === "completed" && styles.completedText,
                  ]}
                >
                  {item.title}
                </Text>

                {!!item.description && (
                  <Text
                    style={[
                      styles.taskDescription,
                      item.status === "completed" && styles.completedText,
                    ]}
                  >
                    {item.description}
                  </Text>
                )}

                <Text style={styles.metaText}>{formatMeta(item)}</Text>
              </View>

              <View style={styles.iconColumn}>
                <TouchableOpacity style={styles.iconButton}>
                  <Feather name="edit-2" size={18} color="#000000" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => handleDelete(item._id)}
                >
                  <Feather name="trash-2" size={18} color="#000000" />
                </TouchableOpacity>
              </View>
            </View>

            {index !== tasks.length - 1 && <View style={styles.divider} />}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No tasks yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button to add your first task.
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <AddTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={handleCreateTask}
      />
    </SafeAreaView>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  heading: {
    fontSize: 30,
    color: "#000000",
    fontWeight: "bold",
    marginBottom: 6,
    margin: 12,
    marginTop: 20,
  },
  subheading: {
    fontSize: 15,
    color: "#666666",
    marginBottom: 18,
    marginHorizontal: 12,
  },
  listContent: {
    paddingBottom: 120,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 18,
  },
  completeCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#BDBDBD",
    marginTop: 4,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  completeCircleFilled: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },
  taskContent: {
    flex: 1,
    paddingRight: 10,
  },
  taskTitle: {
    fontSize: 14,
    color: "#000000",
    marginBottom: 2,
  },
  taskDescription: {
    fontSize: 12,
    color: "#444444",
    lineHeight: 21,
    marginBottom: 2,
  },
  metaText: {
    fontSize: 13,
    color: "#7A7A7A",
    lineHeight: 18,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#9A9A9A",
  },
  iconColumn: {
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 14,
    paddingTop: 2,
  },
  iconButton: {
    padding: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#ECECEC",
    marginLeft: 36,
  },
  emptyWrap: {
    marginTop: 100,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 28,
    color: "#000000",
    fontFamily: "Itim_400Regular",
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#666666",
    textAlign: "center",
    maxWidth: 260,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 34,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  fabText: {
    color: "#FFFFFF",
    fontSize: 34,
    lineHeight: 36,
  },
});