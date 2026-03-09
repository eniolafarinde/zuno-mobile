import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

type Props = {
  label?: string;
  remainingSeconds: number;
  isRunning: boolean;
  onPress?: () => void;
};

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export default function PomodoroWidget({
  label = "Current focus session",
  remainingSeconds,
  isRunning,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={styles.left}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.status}>
          {isRunning ? "In progress" : "Paused"}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.time}>{formatTime(remainingSeconds)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: "#0F172A",
    marginBottom: 16,
  },
  left: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: "#E5E7EB",
    marginBottom: 4,
  },
  status: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  right: {
    paddingLeft: 16,
  },
  time: {
    fontSize: 22,
    fontWeight: "700",
    color: "#22C55E",
  },
});

