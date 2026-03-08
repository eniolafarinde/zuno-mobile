import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";

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
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!title.trim()) return;

    try {
      setLoading(true);
      await onCreate({
        title: title.trim(),
        description: description.trim(),
        priority,
        deadline: deadline.trim() || undefined,
      });

      setTitle("");
      setDescription("");
      setPriority("medium");
      setDeadline("");
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

          <View style={styles.row}>
            <PriorityPill
              label="High"
              active={priority === "high"}
              onPress={() => setPriority("high")}
            />
            <PriorityPill
              label="Medium"
              active={priority === "medium"}
              onPress={() => setPriority("medium")}
            />
            <PriorityPill
              label="Low"
              active={priority === "low"}
              onPress={() => setPriority("low")}
            />
          </View>

          <TextInput
            placeholder="Deadline (YYYY-MM-DDTHH:mm:ss.sssZ)"
            placeholderTextColor="#7A7A7A"
            value={deadline}
            onChangeText={setDeadline}
            style={styles.deadlineInput}
          />

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

function PriorityPill({
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
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 36,
    minHeight: 380,
  },
  titleInput: {
    fontSize: 30,
    color: "#000000",
    fontFamily: "Itim_400Regular",
    marginBottom: 16,
  },
  descriptionInput: {
    fontSize: 18,
    color: "#333333",
    minHeight: 60,
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
    flexWrap: "wrap",
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
    fontSize: 15,
  },
  activePillText: {
    color: "#FFFFFF",
  },
  deadlineInput: {
    borderWidth: 1,
    borderColor: "#D9D9D9",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#000000",
    marginBottom: 18,
  },
  createButton: {
    backgroundColor: "#000000",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Itim_400Regular",
  },
});