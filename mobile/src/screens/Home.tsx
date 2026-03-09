import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import PomodoroWidget from "../components/PomodoroWidget";

export default function Home() {
  const navigation = useNavigation<any>();
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const nextSession = {
    className: "Physics 101",
    time: "6:00 PM - 7:00 PM",
    duration: "60 min",
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.greeting}>Welcome back 👋</Text>
      <Text style={styles.date}>{today}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Next Study Session</Text>
        <Text style={styles.sessionClass}>{nextSession.className}</Text>
        <Text style={styles.sessionTime}>{nextSession.time}</Text>
        <Text style={styles.sessionDuration}>{nextSession.duration}</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate("Pomodoro")}
        >
          <Text style={styles.primaryButtonText}>Start Focus Session</Text>
        </TouchableOpacity>
      </View>

      <PomodoroWidget
        label="Quick Pomodoro"
        remainingSeconds={25 * 60}
        isRunning={false}
        onPress={() => navigation.navigate("Pomodoro")}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today’s Overview</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Tasks Due</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>2h 30m</Text>
            <Text style={styles.statLabel}>Study Time</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>Focus Sessions</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>4/5</Text>
            <Text style={styles.statLabel}>Mood</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>+ Add Class</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>+ Add Task</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Generate Study Schedule</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Motivation</Text>
        <Text style={styles.motivationText}>
          Small progress every day turns into big results. Stay consistent.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F8FAFC",
    flexGrow: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 10,
  },
  date: {
    fontSize: 15,
    color: "#64748B",
    marginTop: 4,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 10,
  },
  sessionClass: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },
  sessionTime: {
    fontSize: 16,
    color: "#475569",
    marginTop: 6,
  },
  sessionDuration: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 4,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2563EB",
  },
  statLabel: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 6,
  },
  actionButton: {
    backgroundColor: "#E2E8F0",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  actionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  motivationText: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 22,
  },
});