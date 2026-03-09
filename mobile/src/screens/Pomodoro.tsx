import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  AppState,
  AppStateStatus,
  Modal,
  Pressable,
} from "react-native";
import Svg, { Circle, Defs, ClipPath, Rect, G, Path } from "react-native-svg";
import { Feather } from "@expo/vector-icons";

type PomodoroMode = "focus" | "break" | "longBreak";
type SceneOption = "minimal" | "forest" | "ocean";
type SoundOption = "none" | "chimes" | "rain";

const FOCUS_PRESETS = [15, 25, 45, 60];
const RING_SIZE = 250;
const STROKE_WIDTH = 12;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const MODE_DURATIONS = {
  focus: 25 * 60,
  break: 5 * 60,
  longBreak: 15 * 60,
};

export default function Pomodoro() {
  const [mode, setMode] = useState<PomodoroMode>("focus");
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [scene, setScene] = useState<SceneOption>("minimal");
  const [sound, setSound] = useState<SoundOption>("chimes");
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [menuVisible, setMenuVisible] = useState(false);

  const targetTimestampRef = useRef<number | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const totalSeconds = useMemo(() => {
    if (mode === "focus") return focusMinutes * 60;
    if (mode === "break") return MODE_DURATIONS.break;
    return MODE_DURATIONS.longBreak;
  }, [mode, focusMinutes]);

  const progress = useMemo(() => {
    if (totalSeconds <= 0) return 0;
    const elapsedRatio = 1 - remainingSeconds / totalSeconds;
    return Math.max(0, Math.min(1, elapsedRatio));
  }, [remainingSeconds, totalSeconds]);

  const ringProgress = useMemo(() => {
    const remainingRatio = remainingSeconds / totalSeconds;
    return Math.max(0, Math.min(1, remainingRatio));
  }, [remainingSeconds, totalSeconds]);

  const scenePalette = useMemo(() => {
    switch (scene) {
      case "forest":
        return {
          pageBg: "#F6FAF7",
          heroBg: "#DDEEE2",
          heroBorder: "#C9E1D1",
          primary: "#163A24",
          secondary: "#4B6A56",
          chipBg: "#FFFFFF",
          chipBorder: "#D7E4DA",
          activeBg: "#163A24",
          activeText: "#FFFFFF",
        };
      case "ocean":
        return {
          pageBg: "#F5FBFF",
          heroBg: "#D9F1FF",
          heroBorder: "#C4E8FB",
          primary: "#14344A",
          secondary: "#51758A",
          chipBg: "#FFFFFF",
          chipBorder: "#D4EAF7",
          activeBg: "#14344A",
          activeText: "#FFFFFF",
        };
      default:
        return {
          pageBg: "#FFFFFF",
          heroBg: "#FAFAFA",
          heroBorder: "#ECECEC",
          primary: "#000000",
          secondary: "#666666",
          chipBg: "#FFFFFF",
          chipBorder: "#E5E5E5",
          activeBg: "#000000",
          activeText: "#FFFFFF",
        };
    }
  }, [scene]);

  useEffect(() => {
    if (!isRunning) return;

    const id = setInterval(() => {
      if (targetTimestampRef.current == null) return;

      const now = Date.now();
      const diffMs = targetTimestampRef.current - now;

      if (diffMs <= 0) {
        setIsRunning(false);
        targetTimestampRef.current = null;
        setRemainingSeconds(0);
        clearInterval(id);
        return;
      }

      setRemainingSeconds(Math.round(diffMs / 1000));
    }, 1000);

    return () => clearInterval(id);
  }, [isRunning]);

  useEffect(() => {
    function handleAppStateChange(nextState: AppStateStatus) {
      if (appState.current.match(/inactive|background/) && nextState === "active") {
        if (isRunning && targetTimestampRef.current != null) {
          const diffMs = targetTimestampRef.current - Date.now();

          if (diffMs <= 0) {
            setIsRunning(false);
            targetTimestampRef.current = null;
            setRemainingSeconds(0);
          } else {
            setRemainingSeconds(Math.round(diffMs / 1000));
          }
        }
      }

      appState.current = nextState;
    }

    const sub = AppState.addEventListener("change", handleAppStateChange);
    return () => sub.remove();
  }, [isRunning]);

  useEffect(() => {
    if (mode === "focus") {
      setRemainingSeconds(focusMinutes * 60);
    } else if (mode === "break") {
      setRemainingSeconds(MODE_DURATIONS.break);
    } else {
      setRemainingSeconds(MODE_DURATIONS.longBreak);
    }

    targetTimestampRef.current = null;
    setIsRunning(false);
  }, [mode, focusMinutes]);

  function formatTime(total: number) {
    const m = Math.floor(total / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(total % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  }

  function toggleRunning() {
    if (isRunning) {
      setIsRunning(false);
      targetTimestampRef.current = null;
      return;
    }

    if (!targetTimestampRef.current) {
      targetTimestampRef.current = Date.now() + remainingSeconds * 1000;
    }

    setIsRunning(true);
  }

  function handleReset() {
    if (mode === "focus") {
      setRemainingSeconds(focusMinutes * 60);
    } else if (mode === "break") {
      setRemainingSeconds(MODE_DURATIONS.break);
    } else {
      setRemainingSeconds(MODE_DURATIONS.longBreak);
    }

    targetTimestampRef.current = null;
    setIsRunning(false);
  }

  function selectFocusMinutes(value: number) {
    setFocusMinutes(value);
    setMode("focus");
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: scenePalette.pageBg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View>
            <Text style={[styles.heading, { color: scenePalette.primary }]}>Pomodoro</Text>
            <Text style={[styles.subheading, { color: scenePalette.secondary }]}>
              Stay present and ease into focus.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.menuButton, { borderColor: scenePalette.chipBorder }]}
            onPress={() => setMenuVisible(true)}
          >
            <Feather name="more-horizontal" size={22} color={scenePalette.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.modeWrap}>
          {(["focus", "break", "longBreak"] as PomodoroMode[]).map((value) => {
            const active = mode === value;
            return (
              <TouchableOpacity
                key={value}
                style={[
                  styles.modeChip,
                  {
                    backgroundColor: active ? scenePalette.activeBg : scenePalette.chipBg,
                    borderColor: active ? scenePalette.activeBg : scenePalette.chipBorder,
                  },
                ]}
                onPress={() => setMode(value)}
              >
                <Text
                  style={[
                    styles.modeChipText,
                    { color: active ? scenePalette.activeText : scenePalette.primary },
                  ]}
                >
                  {modeLabel(value)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: scenePalette.heroBg,
              borderColor: scenePalette.heroBorder,
            },
          ]}
        >
          <View style={styles.visualWrap}>
            {scene === "minimal" && (
              <MinimalTimer
                progress={ringProgress}
                time={formatTime(remainingSeconds)}
                label={modeLabel(mode)}
              />
            )}

            {scene === "forest" && (
              <ForestTimer
                progress={progress}
                time={formatTime(remainingSeconds)}
                label={modeLabel(mode)}
              />
            )}

            {scene === "ocean" && (
              <OceanTimer
                progress={progress}
                time={formatTime(remainingSeconds)}
                label={modeLabel(mode)}
              />
            )}
          </View>

          <View style={styles.timerButtonsRow}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: scenePalette.activeBg }]}
              onPress={toggleRunning}
            >
              <Text style={[styles.primaryButtonText, { color: scenePalette.activeText }]}>
                {isRunning ? "Pause" : "Start"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: scenePalette.chipBorder }]}
              onPress={handleReset}
            >
              <Text style={[styles.secondaryButtonText, { color: scenePalette.primary }]}>
                Reset
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal visible={menuVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <Pressable
            style={[styles.menuSheet, { backgroundColor: "#FFFFFF", borderColor: "#EAEAEA" }]}
            onPress={() => {}}
          >
            <Text style={styles.menuTitle}>Session settings</Text>

            <Text style={styles.menuSectionTitle}>Theme</Text>
            <View style={styles.menuChipRow}>
              {(["minimal", "forest", "ocean"] as SceneOption[]).map((value) => {
                const active = scene === value;
                return (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.menuChip,
                      active && styles.menuChipActive,
                    ]}
                    onPress={() => setScene(value)}
                  >
                    <Text
                      style={[
                        styles.menuChipText,
                        active && styles.menuChipTextActive,
                      ]}
                    >
                      {capitalize(value)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.menuSectionTitle}>Sound</Text>
            <View style={styles.menuChipRow}>
              {(["none", "chimes", "rain"] as SoundOption[]).map((option) => {
                const active = sound === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.menuChip,
                      active && styles.menuChipActive,
                    ]}
                    onPress={() => setSound(option)}
                  >
                    <Text
                      style={[
                        styles.menuChipText,
                        active && styles.menuChipTextActive,
                      ]}
                    >
                      {option === "none"
                        ? "No sound"
                        : option === "chimes"
                        ? "Soft chimes"
                        : "Rain"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.menuSectionTitle}>Focus length</Text>
            <View style={styles.menuChipRow}>
              {FOCUS_PRESETS.map((value) => {
                const active = focusMinutes === value;
                return (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.menuChip,
                      active && styles.menuChipActive,
                    ]}
                    onPress={() => selectFocusMinutes(value)}
                  >
                    <Text
                      style={[
                        styles.menuChipText,
                        active && styles.menuChipTextActive,
                      ]}
                    >
                      {value} min
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setMenuVisible(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function MinimalTimer({
  progress,
  time,
  label,
}: {
  progress: number;
  time: string;
  label: string;
}) {
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <View style={styles.centerVisual}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        <Circle
          stroke="#E6E6E6"
          fill="none"
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE_WIDTH}
        />
        <Circle
          stroke="#000000"
          fill="none"
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
        />
      </Svg>

      <View style={styles.absoluteCenter}>
        <Text style={styles.visualLabelDark}>{label}</Text>
        <Text style={styles.visualTimeDark}>{time}</Text>
      </View>
    </View>
  );
}

function ForestTimer({
  progress,
  time,
  label,
}: {
  progress: number;
  time: string;
  label: string;
}) {
  const treeScale = 0.55 + progress * 0.55;
  const canopyScale = 0.6 + progress * 0.5;
  const leafOpacity = 0.35 + progress * 0.65;

  return (
    <View style={styles.centerVisual}>
      <View style={styles.forestCardInner}>
        <Text style={styles.visualLabelForest}>{label}</Text>
        <Text style={styles.visualTimeForest}>{time}</Text>

        <Svg width={250} height={220} viewBox="0 0 250 220">
          <Rect x="0" y="185" width="250" height="35" rx="18" fill="#B8D7C0" />

          <G origin="125,185" scale={treeScale}>
            <Rect x="117" y="110" width="16" height="78" rx="8" fill="#6C4A2D" />
          </G>

          <G origin="125,110" scale={canopyScale}>
            <Circle cx="125" cy="82" r="44" fill={`rgba(36, 99, 52, ${leafOpacity})`} />
            <Circle cx="92" cy="100" r="30" fill={`rgba(52, 128, 70, ${leafOpacity})`} />
            <Circle cx="158" cy="101" r="32" fill={`rgba(59, 130, 79, ${leafOpacity})`} />
            <Circle cx="125" cy="115" r="34" fill={`rgba(46, 110, 61, ${leafOpacity})`} />
          </G>
        </Svg>
      </View>
    </View>
  );
}

function OceanTimer({
  progress,
  time,
  label,
}: {
  progress: number;
  time: string;
  label: string;
}) {
  const circleRadius = 95;
  const waterTop = 40 + (1 - progress) * 150;

  return (
    <View style={styles.centerVisual}>
      <Text style={styles.visualLabelOcean}>{label}</Text>
      <Text style={styles.visualTimeOcean}>{time}</Text>

      <Svg width={240} height={240} viewBox="0 0 240 240">
        <Defs>
          <ClipPath id="oceanClip">
            <Circle cx="120" cy="120" r={circleRadius} />
          </ClipPath>
        </Defs>

        <Circle cx="120" cy="120" r={circleRadius} fill="#EAF8FF" stroke="#8FD3F4" strokeWidth="4" />

        <G clipPath="url(#oceanClip)">
          <Rect x="0" y={waterTop} width="240" height="240" fill="#7DD3FC" />
          <Path
            d={`M0 ${waterTop + 12}
                C 20 ${waterTop}, 40 ${waterTop + 18}, 60 ${waterTop + 12}
                C 80 ${waterTop + 6}, 100 ${waterTop + 24}, 120 ${waterTop + 12}
                C 140 ${waterTop}, 160 ${waterTop + 18}, 180 ${waterTop + 12}
                C 200 ${waterTop + 6}, 220 ${waterTop + 20}, 240 ${waterTop + 12}
                L240 240 L0 240 Z`}
            fill="#38BDF8"
          />
        </G>
      </Svg>
    </View>
  );
}

function modeLabel(mode: PomodoroMode) {
  if (mode === "focus") return "Focus";
  if (mode === "break") return "Break";
  return "Long break";
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  heading: {
    fontSize: 30,
    marginBottom: 6,
    fontWeight: "700",
    marginTop: 40,
  },
  subheading: {
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 280,
    fontFamily: "Itim_400Regular",
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  modeWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
    justifyContent: "center",
  },
  modeChip: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  modeChipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  heroCard: {
    minHeight: 470,
    borderRadius: 28,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
  },
  visualWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  centerVisual: {
    alignItems: "center",
    justifyContent: "center",
  },
  absoluteCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  visualLabelDark: {
    color: "#666666",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  visualTimeDark: {
    color: "#000000",
    fontSize: 42,
    fontWeight: "700",
    letterSpacing: 2,
  },
  forestCardInner: {
    width: 280,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
  },
  visualLabelForest: {
    color: "#3D5C48",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  visualTimeForest: {
    color: "#163A24",
    fontSize: 42,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 10,
  },
  visualLabelOcean: {
    color: "#4A6C80",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  visualTimeOcean: {
    color: "#14344A",
    fontSize: 42,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 10,
  },
  timerButtonsRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  widgetHint: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  widgetText: {
    fontSize: 14,
    lineHeight: 21,
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
    width: 290,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },
  menuTitle: {
    fontSize: 20,
    color: "#000000",
    marginBottom: 14,
    fontWeight: "600",
  },
  menuSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 8,
    marginTop: 6,
  },
  menuChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  menuChip: {
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
  },
  menuChipActive: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },
  menuChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000000",
  },
  menuChipTextActive: {
    color: "#FFFFFF",
  },
  doneButton: {
    marginTop: 8,
    backgroundColor: "#000000",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});