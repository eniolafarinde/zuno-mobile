import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

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

export default function AddTaskModal({ visible, onClose, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

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

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <TextInput
            placeholder="Task name"
            placeholderTextColor="#7A7A7A"
            value={title}
            onChangeText={setTitle}
            style={styles.titleInput}
          />

          <TextInput
            placeholder="Description"
            placeholderTextColor="#7A7A7A"
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

          <Text style={styles.sectionLabel}>Deadline</Text>
          <TouchableOpacity
            style={styles.deadlineButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.deadlineButtonText}>
              {deadline ? deadline.toLocaleDateString() : "Choose deadline"}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={deadline || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDeadline(selectedDate);
              }}
            />
          )}

          <TouchableOpacity
            style={[styles.createButton, loading && { opacity: 0.7 }]}
            onPress={handleCreate}
            disabled={loading}
          >
            <Text style={styles.createButtonText}>
              {loading ? "Adding..." : "Add Task"}
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
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
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 36,
  },
  titleInput: {
    fontSize: 20,
    color: "#000000",
    marginBottom: 14,
  },
  descriptionInput: {
    fontSize: 16,
    color: "#333333",
    minHeight: 56,
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 13,
    color: "#666666",
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
    borderColor: "#D9D9D9",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  activePill: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },
  pillText: {
    color: "#000000",
    fontSize: 14,
  },
  activePillText: {
    color: "#FFFFFF",
  },
  deadlineButton: {
    borderWidth: 1,
    borderColor: "#D9D9D9",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  deadlineButtonText: {
    color: "#000000",
    fontSize: 15,
  },
  createButton: {
    backgroundColor: "#000000",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
});