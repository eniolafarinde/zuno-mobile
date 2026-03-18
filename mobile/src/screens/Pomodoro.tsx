import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  AppState,
  AppStateStatus,
  Modal,
  Pressable,
  ImageBackground,
  Dimensions,
  FlatList,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import {
  TimerTheme,
  DEFAULT_TIMER_THEMES,
  getThemeBackgroundSource,
} from "../types/timerThemes";

type PomodoroMode = "focus" | "break" | "longBreak";
type SoundOption = "none" | "chimes" | "rain";

const FOCUS_RULER_MINUTES = [20, 25, 30];
const FOCUS_PRESETS_MENU = [15, 25, 45, 60];
const MODE_DURATIONS = {
  focus: 25 * 60,
  break: 5 * 60,
  longBreak: 15 * 60,
};

const OVERLAY_OPACITY = 0.45;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Cylindrical ruler: tick range 0..30 min, compressed spacing toward edges
const RULER_MIN = 0;
const RULER_MAX = 30;
const RULER_TICK_COUNT = RULER_MAX - RULER_MIN + 1; // 31
const RULER_CENTER_INDEX = 25; // index 25 = 25 min (visual center for spacing)
const RULER_BASE_SPACING = 28;

/** Spacing at index i (0..30) — smaller toward edges for cylindrical look */
function rulerSpacing(i: number): number {
  const t = (i - RULER_CENTER_INDEX) / (RULER_TICK_COUNT / 2);
  const factor = 0.45 + 0.55 * Math.cos((t * Math.PI) / 2);
  return RULER_BASE_SPACING * Math.max(0.4, factor);
}

const RULER_TICK_POSITIONS: number[] = (() => {
  const out: number[] = [0];
  for (let i = 0; i < RULER_TICK_COUNT; i++) {
    out.push(out[i] + rulerSpacing(i));
  }
  return out;
})();
const RULER_STRIP_WIDTH = RULER_TICK_POSITIONS[RULER_TICK_COUNT];
const RULER_WINDOW_WIDTH = SCREEN_WIDTH - 40;

/** X position on strip for a given minute (0..30), interpolated */
function rulerPositionAtMinute(min: number): number {
  const i = Math.floor(min);
  const frac = min - i;
  if (i <= 0) return 0;
  if (i >= RULER_TICK_COUNT - 1) return RULER_TICK_POSITIONS[RULER_TICK_COUNT - 1];
  const a = RULER_TICK_POSITIONS[i];
  const b = RULER_TICK_POSITIONS[i + 1];
  return a + frac * (b - a);
}
const THEME_GRID_COLUMNS = 3;
const THEME_CARD_GAP = 12;
const THEME_CARD_SIZE =
  (SCREEN_WIDTH - 20 * 2 - THEME_CARD_GAP * (THEME_GRID_COLUMNS - 1)) /
  THEME_GRID_COLUMNS;

export default function Pomodoro() {
  const [mode, setMode] = useState<PomodoroMode>("focus");
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [sound, setSound] = useState<SoundOption>("chimes");
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [menuVisible, setMenuVisible] = useState(false);
  const [themesModalVisible, setThemesModalVisible] = useState(false);
  const [selectedThemeId, setSelectedThemeId] = useState<string>("minimal");

  const targetTimestampRef = useRef<number | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const rulerTranslateX = useRef(new Animated.Value(0)).current;

  const activeTheme =
    DEFAULT_TIMER_THEMES.find((t) => t.id === selectedThemeId) ??
    DEFAULT_TIMER_THEMES[0];
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

  // Ruler position: keep current remaining minutes at center; moves horizontally as time runs down
  const remainingMinutes = remainingSeconds / 60;
  const rulerTargetX = useMemo(() => {
    if (mode !== "focus") return RULER_WINDOW_WIDTH / 2 - rulerPositionAtMinute(focusMinutes);
    const min = Math.max(RULER_MIN, Math.min(RULER_MAX, remainingMinutes));
    return RULER_WINDOW_WIDTH / 2 - rulerPositionAtMinute(min);
  }, [mode, focusMinutes, remainingMinutes]);

  useEffect(() => {
    Animated.timing(rulerTranslateX, {
      toValue: rulerTargetX,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [rulerTargetX, rulerTranslateX]);

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
      if (
        appState.current.match(/inactive|background/) &&
        nextState === "active"
      ) {
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

  function handleBreak() {
    setMode("break");
  }

  function handleDone() {
    setMode("focus");
    setRemainingSeconds(focusMinutes * 60);
    targetTimestampRef.current = null;
    setIsRunning(false);
  }

  const bgSource = getThemeBackgroundSource(activeTheme);
  const accent = activeTheme.accentColor;
  const fontFamily = activeTheme.fontFamily;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {bgSource ? (
        <ImageBackground
          source={bgSource}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        >
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: `rgba(0,0,0,${OVERLAY_OPACITY})`,
              },
            ]}
          />
        </ImageBackground>
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: activeTheme.backgroundColor },
          ]}
        />
      )}

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.title, { color: accent }]}>Pomodoro</Text>
          <TouchableOpacity
            style={[styles.menuButton, { borderColor: accent }]}
            onPress={() => setMenuVisible(true)}
          >
            <Feather name="more-horizontal" size={22} color={accent} />
          </TouchableOpacity>
        </View>

        <Text
          style={[
            styles.modeLabel,
            { color: accent, opacity: 0.85 },
            fontFamily ? { fontFamily } : undefined,
          ]}
        >
          {modeLabel(mode)}
        </Text>

        <Text
          style={[
            styles.timerDisplay,
            { color: accent },
            fontFamily ? { fontFamily } : undefined,
          ]}
        >
          {formatTime(remainingSeconds)}
        </Text>

        {/* Cylindrical ruler: round look, moves horizontally with time */}
        <View style={styles.rulerWrap}>
          <View style={[styles.rulerWindow, { width: RULER_WINDOW_WIDTH }]}>
            <Animated.View
              style={[
                styles.rulerStrip,
                {
                  width: RULER_STRIP_WIDTH,
                  transform: [{ translateX: rulerTranslateX }],
                },
              ]}
            >
              {Array.from({ length: RULER_TICK_COUNT }, (_, i) => {
                const min = RULER_MIN + i;
                const isMajor = FOCUS_RULER_MINUTES.includes(min);
                const isActive =
                  mode === "focus" &&
                  focusMinutes === min &&
                  Math.floor(remainingMinutes) === min;
                const tickHeight = isMajor ? 22 : 14;
                return (
                  <View
                    key={min}
                    style={[styles.rulerTickCell, { width: rulerSpacing(i) }]}
                  >
                    <View
                      style={[
                        styles.rulerTickLine,
                        {
                          height: tickHeight,
                          backgroundColor: isActive ? accent : `${accent}66`,
                          width: isMajor ? 2.5 : 1.5,
                        },
                      ]}
                    />
                    {isMajor && (
                      <Text
                        style={[
                          styles.rulerTickNumber,
                          { color: isActive ? accent : `${accent}aa` },
                          fontFamily ? { fontFamily } : undefined,
                        ]}
                      >
                        {min}
                      </Text>
                    )}
                  </View>
                );
              })}
            </Animated.View>
          </View>
          {/* Fixed tappable preset labels */}
          <View style={[styles.rulerPresets, { width: RULER_WINDOW_WIDTH }]}>
            {FOCUS_RULER_MINUTES.map((min) => {
              const active = mode === "focus" && focusMinutes === min;
              return (
                <TouchableOpacity
                  key={min}
                  style={styles.rulerPresetTouch}
                  onPress={() => selectFocusMinutes(min)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.rulerPresetLabel,
                      { color: active ? accent : `${accent}99` },
                      fontFamily ? { fontFamily } : undefined,
                    ]}
                  >
                    {min}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Controls: Break | Play | Done */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.sideButton, { borderColor: `${accent}66` }]}
            onPress={handleBreak}
          >
            <Feather name="coffee" size={24} color={accent} />
            <Text
              style={[
                styles.sideButtonLabel,
                { color: accent },
                fontFamily ? { fontFamily } : undefined,
              ]}
            >
              Break
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.playButton, { borderColor: `${accent}99` }]}
            onPress={toggleRunning}
            activeOpacity={0.9}
          >
            <View style={[styles.playButtonInner, { backgroundColor: `${accent}22` }]}>
              <Feather
                name={isRunning ? "pause" : "play"}
                size={44}
                color={accent}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sideButton, { borderColor: `${accent}66` }]}
            onPress={handleDone}
          >
            <Feather name="check" size={24} color={accent} />
            <Text
              style={[
                styles.sideButtonLabel,
                { color: accent },
                fontFamily ? { fontFamily } : undefined,
              ]}
            >
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Session settings modal */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <Pressable
            style={styles.menuSheet}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.menuTitle}>Session settings</Text>

            <TouchableOpacity
              style={styles.themesEntry}
              onPress={() => {
                setMenuVisible(false);
                setThemesModalVisible(true);
              }}
            >
              <Text style={styles.themesEntryLabel}>Timer Themes</Text>
              <Feather name="chevron-right" size={20} color="#000" />
            </TouchableOpacity>

            <Text style={styles.menuSectionTitle}>Sound</Text>
            <View style={styles.menuChipRow}>
              {(["none", "chimes", "rain"] as SoundOption[]).map((option) => {
                const active = sound === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.menuChip, active && styles.menuChipActive]}
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
              {FOCUS_PRESETS_MENU.map((value) => {
                const active = focusMinutes === value;
                return (
                  <TouchableOpacity
                    key={value}
                    style={[styles.menuChip, active && styles.menuChipActive]}
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

      {/* Timer Themes selection modal */}
      <Modal
        visible={themesModalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.themesModalContainer}>
          <View style={styles.themesModalHeader}>
            <Text style={styles.themesModalTitle}>Timer Themes</Text>
            <TouchableOpacity
              onPress={() => setThemesModalVisible(false)}
              style={styles.themesModalClose}
            >
              <Feather name="x" size={26} color="#000" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={DEFAULT_TIMER_THEMES}
            keyExtractor={(item) => item.id}
            numColumns={THEME_GRID_COLUMNS}
            contentContainerStyle={styles.themesGrid}
            columnWrapperStyle={styles.themesRow}
            renderItem={({ item: theme }) => (
              <ThemePreviewCard
                theme={theme}
                isSelected={selectedThemeId === theme.id}
                onSelect={() => {
                  setSelectedThemeId(theme.id);
                  setThemesModalVisible(false);
                }}
                cardSize={THEME_CARD_SIZE}
              />
            )}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function ThemePreviewCard({
  theme,
  isSelected,
  onSelect,
  cardSize,
}: {
  theme: TimerTheme;
  isSelected: boolean;
  onSelect: () => void;
  cardSize: number;
}) {
  const bgSource = getThemeBackgroundSource(theme);
  const accent = theme.accentColor;

  return (
    <TouchableOpacity
      style={[styles.themeCard, { width: cardSize, height: cardSize * 1.1 }]}
      onPress={onSelect}
      activeOpacity={0.9}
    >
      <View style={[styles.themeCardPreview, { width: cardSize, height: cardSize }]}>
        {bgSource ? (
          <ImageBackground
            source={bgSource}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          >
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: "rgba(0,0,0,0.4)" },
              ]}
            />
          </ImageBackground>
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: theme.backgroundColor },
            ]}
          />
        )}
        <View style={styles.themeCardPreviewContent}>
          <Text
            style={[styles.themeCardTime, { color: accent }]}
            numberOfLines={1}
          >
            25:00
          </Text>
          <View style={[styles.themeCardPlayHint, { backgroundColor: `${accent}44` }]}>
            <Feather name="play" size={14} color={accent} />
          </View>
        </View>
      </View>
      <View style={styles.themeCardFooter}>
        {theme.isPremium && (
          <View style={styles.themeCardCrown}>
            <Ionicons name="diamond" size={14} color="#b8860b" />
          </View>
        )}
        <Text style={styles.themeCardName} numberOfLines={1}>
          {theme.name}
        </Text>
        {isSelected && (
          <View style={styles.themeCardCheck}>
            <Feather name="check" size={16} color="#fff" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function modeLabel(mode: PomodoroMode) {
  if (mode === "focus") return "Focus";
  if (mode === "break") return "Break";
  return "Long break";
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 24,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "200",
    letterSpacing: 0.5,
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  modeLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  timerDisplay: {
    fontSize: 64,
    fontWeight: "200",
    letterSpacing: 2,
    marginBottom: 24,
  },
  rulerWrap: {
    marginBottom: 28,
    alignItems: "center",
  },
  rulerWindow: {
    height: 52,
    overflow: "hidden",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  rulerStrip: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    height: 52,
    paddingBottom: 6,
  },
  rulerTickCell: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  rulerTickLine: {
    borderRadius: 1,
    marginBottom: 4,
  },
  rulerTickNumber: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  rulerPresets: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 12,
  },
  rulerPresetTouch: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  rulerPresetLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  sideButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  sideButtonLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
    letterSpacing: 0.3,
  },
  playButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  playButtonInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    padding: 18,
  },
  menuTitle: {
    fontSize: 20,
    color: "#000000",
    marginBottom: 14,
    fontWeight: "600",
  },
  themesEntry: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  themesEntryLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
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
  themesModalContainer: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    marginTop: 48,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  themesModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  themesModalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
  },
  themesModalClose: {
    padding: 4,
  },
  themesGrid: {
    paddingBottom: 24,
  },
  themesRow: {
    justifyContent: "space-between",
    marginBottom: THEME_CARD_GAP,
  },
  themeCard: {},
  themeCardPreview: {
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  themeCardPreviewContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  themeCardTime: {
    fontSize: 22,
    fontWeight: "200",
    letterSpacing: 1,
    marginBottom: 8,
  },
  themeCardPlayHint: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  themeCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  themeCardCrown: {
    marginRight: 4,
  },
  themeCardName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
  },
  themeCardCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
});
