import { ImageSourcePropType } from "react-native";

export interface TimerTheme {
  id: string;
  name: string;
  /** require(./path/to/image) or { uri: 'https://...' }. Omit or use transparent for solid overlay-only. */
  backgroundSource: ImageSourcePropType | null;
  /** Fallback when no image; also used for overlay tint. */
  backgroundColor: string;
  accentColor: string;
  fontFamily?: string;
  isPremium: boolean;
}

/**
 * Default timer themes.
 * To use image backgrounds, set backgroundSource to require():
 *   backgroundSource: require('../../assets/pomodoro/rain-effect-beach-background.jpg'),
 * Add assets under mobile/assets/pomodoro/ (e.g. rain, library, bookshop, beach, tokyo).
 */
export const DEFAULT_TIMER_THEMES: TimerTheme[] = [
  {
    id: "minimal",
    name: "Minimal",
    backgroundSource: null,
    backgroundColor: "#1a1a1a",
    accentColor: "#ffffff",
    fontFamily: undefined,
    isPremium: false,
  },
  {
    id: "rain",
    name: "Rain",
    backgroundSource: null,
    backgroundColor: "#0f1729",
    accentColor: "#94a3b8",
    fontFamily: undefined,
    isPremium: false,
  },
  {
    id: "library",
    name: "Library",
    backgroundSource: null,
    backgroundColor: "#2c2419",
    accentColor: "#e8dcc4",
    fontFamily: undefined,
    isPremium: false,
  },
  {
    id: "bookshop",
    name: "Bookshop",
    backgroundSource: null,
    backgroundColor: "#1e1a14",
    accentColor: "#d4c4a8",
    fontFamily: undefined,
    isPremium: true,
  },
  {
    id: "beach",
    name: "Beach",
    backgroundSource: null,
    backgroundColor: "#0c1820",
    accentColor: "#a8d4e6",
    fontFamily: undefined,
    isPremium: true,
  },
  {
    id: "tokyo",
    name: "Tokyo",
    backgroundSource: null,
    backgroundColor: "#1a1520",
    accentColor: "#c4b5fd",
    fontFamily: undefined,
    isPremium: true,
  },
];

/** Resolve optional image. Use in component: source={theme.backgroundSource ?? undefined}. */
export function getThemeBackgroundSource(theme: TimerTheme): ImageSourcePropType | undefined {
  if (theme.backgroundSource == null) return undefined;
  return theme.backgroundSource as ImageSourcePropType;
}
