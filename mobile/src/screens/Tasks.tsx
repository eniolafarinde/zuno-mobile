import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView
} from "react-native";
import AddTaskModal from "../components/AddTaskModal";
import { createTask, getTasks, Task } from "../api/tasks";

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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Tasks</Text>
      <Text style={styles.subheading}>
        Organize what needs to get done.
      </Text>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityText}>{item.priority}</Text>
              </View>
            </View>

            {!!item.description && (
              <Text style={styles.taskDescription}>{item.description}</Text>
            )}

            {!!item.deadline && (
              <Text style={styles.deadlineText}>
                Due: {new Date(item.deadline).toLocaleString()}
              </Text>
            )}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  heading: {
    fontSize: 42,
    color: "#000000",
    fontFamily: "Itim_400Regular",
    marginBottom: 6,
    textAlign: "center",
  },
  subheading: {
    fontSize: 15,
    color: "#666666",
    marginBottom: 20,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 120,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAEAEA",
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskTitle: {
    fontSize: 20,
    color: "#000000",
    fontFamily: "Itim_400Regular",
    flex: 1,
    marginRight: 10,
  },
  priorityBadge: {
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  priorityText: {
    color: "#000000",
    fontSize: 12,
    textTransform: "capitalize",
  },
  taskDescription: {
    color: "#555555",
    fontSize: 15,
    marginTop: 10,
  },
  deadlineText: {
    color: "#777777",
    fontSize: 13,
    marginTop: 10,
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
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  fabText: {
    color: "#FFFFFF",
    fontSize: 34,
    lineHeight: 38,
  },
});