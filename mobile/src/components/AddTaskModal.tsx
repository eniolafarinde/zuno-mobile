import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreate: (task: {
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    deadline?: string;
  }) => Promise<void>;
};

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

function getQuickDate(option: "today" | "tomorrow" | "weekend" | "nextWeek"): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (option === "today") return d;
  if (option === "tomorrow") {
    d.setDate(d.getDate() + 1);
    return d;
  }
  if (option === "weekend") {
    const day = d.getDay();
    const daysUntilSat = day === 0 ? 6 : 6 - day;
    d.setDate(d.getDate() + daysUntilSat);
    return d;
  }
  const day = d.getDay();
  const daysUntilMon = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + daysUntilMon);
  return d;
}

export default function AddTaskModal({ visible, onClose, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [loading, setLoading] = useState(false);
  const titleInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => {
        titleInputRef.current?.focus();
      }, 300);
      return () => clearTimeout(t);
    }
  }, [visible]);

  async function handleCreate() {
    if (!title.trim()) return;

    try {
      setLoading(true);
      await onCreate({
        title: title.trim(),
        description: description.trim(),
        priority,
        deadline: deadline ? deadline.toISOString() : undefined,
      });

      setTitle("");
      setDescription("");
      setPriority("medium");
      setDeadline(null);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  const monthDays = getMonthDays(calendarMonth.getFullYear(), calendarMonth.getMonth());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.titleRow}>
            <TextInput
              ref={titleInputRef}
              placeholder="Task name"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
              style={styles.titleInput}
            />
            <TouchableOpacity
              style={[styles.submitRoundButton, loading && { opacity: 0.7 }]}
              onPress={handleCreate}
              disabled={loading}
            >
              <Feather name="arrow-up" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Description"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            style={styles.descriptionInput}
            multiline
          />

          <Text style={styles.sectionLabel}>Priority</Text>
          <View style={styles.row}>
            <Pill label="High" active={priority === "high"} onPress={() => setPriority("high")} />
            <Pill label="Medium" active={priority === "medium"} onPress={() => setPriority("medium")} />
            <Pill label="Low" active={priority === "low"} onPress={() => setPriority("low")} />
          </View>

          <Text style={styles.sectionLabel}>Date</Text>
          <TouchableOpacity
            style={styles.deadlineButton}
            onPress={() => setShowCalendar(true)}
          >
            <View style={styles.deadlineContent}>
              <View style={styles.deadlineLeft}>
                <Feather name="calendar" size={16} color="#6B7280" />
                <Text style={styles.deadlineButtonText}>
                  {deadline
                    ? deadline.toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })
                    : "Choose a date"}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color="#6B7280" />
            </View>
          </TouchableOpacity>
        </Pressable>
      </Pressable>

      <Modal visible={showCalendar} animationType="slide" transparent>
        <Pressable style={styles.calendarOverlay} onPress={() => setShowCalendar(false)}>
          <Pressable style={styles.calendarSheet} onPress={() => {}}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => setShowCalendar(false)} hitSlop={12}>
                <Feather name="x" size={24} color="#111111" />
              </TouchableOpacity>
              <Text style={styles.calendarTitle}>Date</Text>
              <TouchableOpacity
                onPress={() => setShowCalendar(false)}
                hitSlop={12}
              >
                <Feather name="check" size={24} color="#111111" />
              </TouchableOpacity>
            </View>

            <View style={styles.quickRow}>
              <QuickDateChip
                label="Today"
                sublabel={new Date().toLocaleDateString(undefined, { weekday: "short" })}
                onPress={() => {
                  setDeadline(getQuickDate("today"));
                  setShowCalendar(false);
                }}
              />
              <QuickDateChip
                label="Tomorrow"
                sublabel={getQuickDate("tomorrow").toLocaleDateString(undefined, { weekday: "short" })}
                onPress={() => {
                  setDeadline(getQuickDate("tomorrow"));
                  setShowCalendar(false);
                }}
              />
              <QuickDateChip
                label="This Weekend"
                sublabel={getQuickDate("weekend").toLocaleDateString(undefined, { weekday: "short" })}
                onPress={() => {
                  setDeadline(getQuickDate("weekend"));
                  setShowCalendar(false);
                }}
              />
              <QuickDateChip
                label="Next Week"
                sublabel={getQuickDate("nextWeek").toLocaleDateString(undefined, { weekday: "short" })}
                onPress={() => {
                  setDeadline(getQuickDate("nextWeek"));
                  setShowCalendar(false);
                }}
              />
            </View>

            <Text style={styles.calendarMonthLabel}>
              {calendarMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </Text>

            <View style={styles.weekdayRow}>
              {WEEKDAYS.map((w, i) => (
                <Text key={i} style={styles.weekdayCell}>
                  {w}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {monthDays.map((day, i) => {
                if (day === null) return <View key={`e-${i}`} style={styles.dayCell} />;

                const cellDate = new Date(
                  calendarMonth.getFullYear(),
                  calendarMonth.getMonth(),
                  day
                );
                cellDate.setHours(0, 0, 0, 0);

                const isSelected = deadline && deadline.getTime() === cellDate.getTime();
                const isToday = today.getTime() === cellDate.getTime();

                return (
                  <TouchableOpacity
                    key={`${day}-${i}`}
                    style={[
                      styles.dayCell,
                      isToday && styles.dayCellToday,
                      isSelected && styles.dayCellSelected,
                    ]}
                    onPress={() => {
                      setDeadline(cellDate);
                      setShowCalendar(false);
                    }}
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
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.calendarNav}>
              <TouchableOpacity
                onPress={() =>
                  setCalendarMonth(
                    new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1)
                  )
                }
              >
                <Feather name="chevron-left" size={24} color="#6B7280" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  setCalendarMonth(
                    new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1)
                  )
                }
              >
                <Feather name="chevron-right" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Modal>
  );
}

function QuickDateChip({
  label,
  sublabel,
  onPress,
}: {
  label: string;
  sublabel: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.quickChip} onPress={onPress}>
      <Text style={styles.quickChipLabel}>{label}</Text>
      <Text style={styles.quickChipSublabel}>{sublabel}</Text>
    </TouchableOpacity>
  );
}

function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.pill, active && styles.activePill]}
      onPress={onPress}
    >
      <Text style={[styles.pillText, active && styles.activePillText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  titleInput: {
    flex: 1,
    fontSize: 18,
    color: "#111111",
    paddingVertical: 8,
  },
  submitRoundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  descriptionInput: {
    fontSize: 15,
    color: "#4B5563",
    minHeight: 48,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 10,
    marginTop: 2,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  pill: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
  },
  activePill: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },
  pillText: {
    color: "#111111",
    fontSize: 14,
  },
  activePillText: {
    color: "#FFFFFF",
  },
  deadlineButton: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  deadlineContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  deadlineLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  deadlineButtonText: {
    color: "#111111",
    fontSize: 15,
  },

  calendarOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "flex-end",
  },
  calendarSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111111",
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  quickChip: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    minWidth: 80,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quickChipLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111111",
  },
  quickChipSublabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  calendarMonthLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111111",
    marginBottom: 12,
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    color: "#6B7280",
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
    borderRadius: 40,
    height: 40,
  },
  dayCellToday: {
    backgroundColor: "#F3F4F6",
  },
  dayCellSelected: {
    backgroundColor: "#000000",
  },
  dayCellText: {
    fontSize: 15,
    color: "#111111",
  },
  dayCellTextToday: {
    color: "#111111",
    fontWeight: "700",
  },
  dayCellTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  calendarNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingHorizontal: 8,
  },
});