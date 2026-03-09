import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import AddTaskModal from "../components/AddTaskModal";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  Task,
} from "../api/tasks";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function getMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startOffset = first.getDay();
  const daysInMonth = last.getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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
      completedAt:
        task.status === "completed" ? null : new Date().toISOString(),
    });

    setTasks((prev) =>
      prev.map((item) => (item._id === updated._id ? updated : item)),
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

  function getPriorityColor(priority: Task["priority"]) {
    if (priority === "high") return "#EF4444";
    if (priority === "medium") return "#F97316";
    return "#217740ff";
  }

  function getDeadlineColor(deadline?: string | null) {
    if (!deadline) return "#217740ff";
    const date = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    if (target < today) return "#EF4444";
    if (target.getTime() === today.getTime()) return "#22C55E";
    return "#0EA5E9";
  }

  function formatDeadline(deadline?: string | null) {
    if (!deadline) return "No date";
    const date = new Date(deadline);
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  const { tasksByDate, noDueDateTasks } = useMemo(() => {
    const byDate: Record<string, Task[]> = {};
    const noDue: Task[] = [];
    for (const t of tasks) {
      if (!t.deadline) {
        noDue.push(t);
        continue;
      }
      const key = dateKey(new Date(t.deadline));
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push(t);
    }
    return { tasksByDate: byDate, noDueDateTasks: noDue };
  }, [tasks]);

  const monthDays = getMonthDays(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth(),
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.heading}>Tasks</Text>
          <Text style={styles.subheading}>Plan what needs to get done.</Text>
        </View>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
        >
          <Feather name="more-horizontal" size={22} color="#000000" />
        </TouchableOpacity>
      </View>

      {viewMode === "list" ? (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <View>
              <Swipeable
                renderRightActions={() => (
                  <View style={styles.swipeActions}>
                    <TouchableOpacity
                      style={[styles.swipeButton, styles.swipeDelete]}
                      onPress={() => handleDelete(item._id)}
                    >
                      <Feather name="trash-2" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                )}
              >
                <View style={styles.taskRow}>
                  <TouchableOpacity
                    style={[
                      styles.completeCircle,
                      item.status === "completed" &&
                        styles.completeCircleFilled,
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

                    <View style={styles.metaRow}>
                      <View
                        style={[
                          styles.priorityPill,
                          { borderColor: getPriorityColor(item.priority) },
                        ]}
                      >
                        <View
                          style={[
                            styles.priorityDot,
                            {
                              backgroundColor: getPriorityColor(item.priority),
                            },
                          ]}
                        />
                        <Text
                          style={[
                            styles.priorityText,
                            { color: getPriorityColor(item.priority) },
                          ]}
                        >
                          {capitalize(item.priority)}
                        </Text>
                      </View>

                      {item.deadline && (
                        <View style={styles.deadlineRow}>
                          <Feather
                            name="calendar"
                            size={14}
                            color={getDeadlineColor(item.deadline)}
                            style={{ marginRight: 4 }}
                          />
                          <Text
                            style={[
                              styles.deadlineText,
                              { color: getDeadlineColor(item.deadline) },
                            ]}
                          >
                            {formatDeadline(item.deadline)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </Swipeable>

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
      ) : (
        <ScrollView
          contentContainerStyle={styles.calendarContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarMonthLabel}>
                {calendarMonth.toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </Text>
              <View style={styles.calendarNav}>
                <TouchableOpacity
                  onPress={() =>
                    setCalendarMonth(
                      new Date(
                        calendarMonth.getFullYear(),
                        calendarMonth.getMonth() - 1,
                      ),
                    )
                  }
                >
                  <Feather name="chevron-left" size={24} color="#000000" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    setCalendarMonth(
                      new Date(
                        calendarMonth.getFullYear(),
                        calendarMonth.getMonth() + 1,
                      ),
                    )
                  }
                >
                  <Feather name="chevron-right" size={24} color="#000000" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.weekdayRow}>
              {WEEKDAYS.map((w, i) => (
                <Text key={i} style={styles.weekdayCell}>
                  {w}
                </Text>
              ))}
            </View>
            <View style={styles.calendarGrid}>
              {monthDays.map((day, i) => {
                if (day === null)
                  return <View key={`e-${i}`} style={styles.dayCell} />;
                const cellDate = new Date(
                  calendarMonth.getFullYear(),
                  calendarMonth.getMonth(),
                  day,
                );
                cellDate.setHours(0, 0, 0, 0);
                const key = dateKey(cellDate);
                const dayTasks = tasksByDate[key] ?? [];
                const isSelected =
                  selectedDate && dateKey(selectedDate) === key;
                const isToday = today.getTime() === cellDate.getTime();
                return (
                  <TouchableOpacity
                    key={`${day}-${i}`}
                    style={[
                      styles.dayCell,
                      isToday && styles.dayCellToday,
                      isSelected && styles.dayCellSelected,
                    ]}
                    onPress={() => setSelectedDate(cellDate)}
                  >
                    <Text
                      style={[
                        styles.dayCellText,
                        isToday && styles.dayCellTextToday,
                        isSelected && styles.dayCellTextSelected,
                      ]}
                    >
                      {day}
                    </Text>
                    {dayTasks.length > 0 && (
                      <View style={styles.dayBadge}>
                        <Text style={styles.dayBadgeText}>
                          {dayTasks.length}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {selectedDate &&
            (() => {
              const key = dateKey(selectedDate);
              const dayTasks = tasksByDate[key] ?? [];
              if (dayTasks.length === 0) return null;
              return (
                <View style={styles.dayTasksSection}>
                  <Text style={styles.dayTasksSectionTitle}>
                    Tasks on{" "}
                    {selectedDate.toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                  {dayTasks.map((item) => (
                    <TaskRowCompact
                      key={item._id}
                      item={item}
                      onComplete={() => handleComplete(item)}
                      onDelete={() => handleDelete(item._id)}
                      getPriorityColor={getPriorityColor}
                      capitalize={capitalize}
                    />
                  ))}
                </View>
              );
            })()}

          <View style={styles.noDueSection}>
            <Text style={styles.noDueTitle}>No due date</Text>
            {noDueDateTasks.length === 0 ? (
              <Text style={styles.noDueEmpty}>
                No tasks without a due date.
              </Text>
            ) : (
              noDueDateTasks.map((item) => (
                <TaskRowCompact
                  key={item._id}
                  item={item}
                  onComplete={() => handleComplete(item)}
                  onDelete={() => handleDelete(item._id)}
                  getPriorityColor={getPriorityColor}
                  capitalize={capitalize}
                />
              ))
            )}
          </View>
        </ScrollView>
      )}

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

      <Modal visible={menuVisible} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <Pressable style={styles.menuSheet} onPress={() => {}}>
            <Text style={styles.menuTitle}>View</Text>
            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => {
                setViewMode("list");
                setMenuVisible(false);
              }}
            >
              <Feather name="list" size={20} color="#000000" />
              <Text style={styles.menuOptionText}>View as list</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => {
                setViewMode("calendar");
                setMenuVisible(false);
              }}
            >
              <Feather name="calendar" size={20} color="#000000" />
              <Text style={styles.menuOptionText}>View in calendar format</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function TaskRowCompact({
  item,
  onComplete,
  onDelete,
  getPriorityColor,
  capitalize: cap,
}: {
  item: Task;
  onComplete: () => void;
  onDelete: () => void;
  getPriorityColor: (p: Task["priority"]) => string;
  capitalize: (s: string) => string;
}) {
  return (
    <View style={styles.compactRow}>
      <TouchableOpacity
        style={[
          styles.completeCircle,
          item.status === "completed" && styles.completeCircleFilled,
        ]}
        onPress={onComplete}
      >
        {item.status === "completed" && (
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        )}
      </TouchableOpacity>
      <View style={styles.compactContent}>
        <Text
          style={[
            styles.compactTitle,
            item.status === "completed" && styles.completedText,
          ]}
        >
          {item.title}
        </Text>
        <View
          style={[
            styles.priorityPill,
            { borderColor: getPriorityColor(item.priority) },
          ]}
        >
          <View
            style={[
              styles.priorityDot,
              { backgroundColor: getPriorityColor(item.priority) },
            ]}
          />
          <Text
            style={[
              styles.priorityText,
              { color: getPriorityColor(item.priority) },
            ]}
          >
            {cap(item.priority)}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.compactDelete} onPress={onDelete}>
        <Feather name="trash-2" size={18} color="#000000" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    paddingHorizontal: 12,
    marginTop: 12,
  },

  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginTop: 40,
    marginRight: 12,
  },
  heading: {
    fontSize: 30,
    color: "#000000",
    fontWeight: "bold",
    marginBottom: 6,
    marginTop: 40,
    margin: 12,
  },
  subheading: {
    fontSize: 15,
    color: "#666666",
    marginBottom: 18,
    fontFamily: "Itim_400Regular",
    margin: 12,
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
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
    marginBottom: -6,
  },
  priorityPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
  },
  deadlineRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  deadlineText: {
    fontSize: 12,
  },
  swipeActions: {
    width: 96,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  swipeButton: {
    width: 80,
    borderRadius: 18,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },
  swipeDelete: {
    backgroundColor: "#EF4444",
    width: 50,
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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  fabText: {
    color: "#FFFFFF",
    fontSize: 34,
    lineHeight: 36,
  },

  calendarContent: {
    paddingBottom: 120,
  },
  calendarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#f0f0f0ff",
    margin: 12,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  calendarMonthLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  calendarNav: {
    flexDirection: "row",
    gap: 8,
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 32,
    position: "relative",
    height: 42,
  },
  dayCellToday: {
    backgroundColor: "rgba(210, 210, 210, 0.2)",
  },
  dayCellSelected: {
    backgroundColor: "#000000",
  },
  dayCellText: {
    fontSize: 14,
    color: "#0F172A",
  },
  dayCellTextToday: {
    color: "#000000",
    fontWeight: "700",
  },
  dayCellTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  dayBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  dayBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  dayTasksSection: {
    marginBottom: 24,
    margin: 12,
  },
  dayTasksSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  noDueSection: {
    marginBottom: 24,
    marginHorizontal: 12,
  },
  noDueTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  noDueEmpty: {
    fontSize: 14,
    color: "#64748B",
  },
  compactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    margin: 12,
  },
  compactContent: {
    flex: 1,
    marginLeft: 10,
  },
  compactTitle: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "500",
  },
  compactDelete: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 90,
    paddingRight: 20,
  },
  menuSheet: {
    width: 280,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    backgroundColor: "#FFFFFF",
    padding: 18,
  },
  menuTitle: {
    fontSize: 20,
    color: "#000000",
    marginBottom: 14,
    fontWeight: "600",
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  menuOptionText: {
    fontSize: 15,
    color: "#000000",
    fontWeight: "500",
  },

});
