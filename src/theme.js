// EMS theme — aligned to the MPS palette.
//
// Mid-contrast modern look: cool-grey page background with white cards, visible
// borders, near-black text, and Indigo-600 as the brand colour. The original
// EMS `custom.*` tokens and Switch/Slider styles are preserved below so existing
// components that reference them keep working.

import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const config = {
  // Match MPS — always light (was useSystemColorMode: true).
  initialColorMode: "light",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  fonts: {
    heading:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
    body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
    mono: '"JetBrains Mono", source-code-pro, Menlo, Monaco, Consolas, monospace',
  },
  styles: {
    global: {
      "html, body, #root": {
        height: "100%",
        background: "#E9ECF4",
        color: "#0B0F19",
        fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
        letterSpacing: "-0.005em",
      },
      "*::-webkit-scrollbar": { width: "10px", height: "10px" },
      "*::-webkit-scrollbar-track": { background: "transparent" },
      "*::-webkit-scrollbar-thumb": {
        background: "#B8BFCC",
        borderRadius: "5px",
        border: "2px solid transparent",
        backgroundClip: "padding-box",
      },
      "*::-webkit-scrollbar-thumb:hover": { background: "#94A3B8" },
      "*:focus-visible": { outline: "none", boxShadow: "0 0 0 3px rgba(79,70,229,0.30)" },
    },
  },
  colors: {
    // ── MPS brand palette (Indigo) ──────────────────────────────
    brand: {
      50:  "#EEF2FF",
      100: "#DEE3FF",
      200: "#BFC8FF",
      300: "#94A1FF",
      400: "#6E7BF0",
      500: "#5057E1",
      600: "#4F46E5", // primary
      700: "#4338CA", // hover
      800: "#3730A3",
      900: "#1E1B4B",
    },
    semantic: {
      success: "#059669",
      warning: "#D97706",
      danger:  "#DC2626",
      info:    "#0284C7",
    },
    surface: {
      bg:       "#E9ECF4",
      bgSubtle: "#DEE3EC",
      panel:    "#FFFFFF",
      panelAlt: "#F4F6FB",
      border:   "#D6DBE5",
      borderHi: "#A9B2C2",
      hover:    "#EEF1F7",
      muted:    "#3C4759",
      subtle:   "#6B7280",
      strong:   "#0B0F19",
    },
    // ── Original EMS tokens (preserved for back-compat) ─────────
    custom: {
      primary: "#C8D6E5",
      darkModePrimary: "#54637A",
      mobileLightNavBg: "#F4F4F5",
      mobileDarkNavBG: "#333333",
      lightModeText: "#1A1A1A",
      darkModeText: "#FFFFFF",
      lightSecondaryText: "#4E5258",
      darkSecondaryText: "#A3AEBD",
      lightModeBg: "#FCFCFC",
      darkModeBg: "#231F1F",
      accent: "#4F46E5", // realigned from #5F4BB6 to the MPS indigo
      bottomNavText: "#65758B",
      selectedBottomNavText: "#1A1A1A",
      tabDarkMode: "#94A3B8",
      tabInactiveDarkBg: "#3F3F3F",
      tabInactiveLightBg: "#E1E1E2",
      secondaryTextColor: "#65758B",
      dashboardCardLight: "#EAEAEA",
      dashboardCardDark: "#2B2B2B",
      lightModeGreen: "#7BC111",
      darkModeGreen: "#95DA25",
      lightModeRed: "#AF0303",
      darkModeRed: "#FF8888",
      groupingCard: "#D0D0D4",
      lightModalBorder: "#D0D0D4",
      darkModalBorder: "#5F5F5F",
    },
  },
  shadows: {
    xs: "0 1px 2px rgba(15, 23, 42, 0.06)",
    sm: "0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)",
    md: "0 4px 6px -1px rgba(15, 23, 42, 0.10), 0 2px 4px -2px rgba(15, 23, 42, 0.06)",
    lg: "0 10px 15px -3px rgba(15, 23, 42, 0.10), 0 4px 6px -4px rgba(15, 23, 42, 0.05)",
    xl: "0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.06)",
    brand: "0 4px 14px 0 rgba(79, 70, 229, 0.30)",
    panel: "0 1px 0 rgba(15, 23, 42, 0.04), 0 4px 12px -4px rgba(15, 23, 42, 0.08)",
  },
  components: {
    Button: {
      baseStyle: { fontWeight: 600, borderRadius: "lg" },
      variants: {
        // Indigo solid only when colorScheme is brand; other schemes untouched.
        solid: (props) =>
          props.colorScheme === "brand" && {
            bg: "brand.600",
            color: "white",
            boxShadow: "brand",
            _hover: { bg: "brand.700", boxShadow: "lg", _disabled: { bg: "brand.600" } },
            _active: { bg: "brand.800" },
          },
      },
    },
    Heading: {
      baseStyle: { fontWeight: 700, letterSpacing: "-0.025em" },
    },
    Tag: {
      variants: {
        subtle: (props) => ({
          container: {
            bg: `${props.colorScheme}.50`,
            color: `${props.colorScheme}.700`,
            border: "1px solid",
            borderColor: `${props.colorScheme}.200`,
            fontWeight: 600,
          },
        }),
      },
    },
    Badge: {
      baseStyle: { textTransform: "none", fontWeight: 600, borderRadius: "md" },
    },
    Input: {
      variants: {
        outline: {
          field: {
            bg: "white",
            borderColor: "surface.border",
            _hover: { borderColor: "surface.borderHi" },
            _focus: { borderColor: "brand.500", boxShadow: "0 0 0 3px rgba(79,70,229,0.18)" },
          },
        },
      },
    },
    Select: {
      variants: {
        outline: {
          field: {
            bg: "white",
            borderColor: "surface.border",
            _hover: { borderColor: "surface.borderHi" },
            _focus: { borderColor: "brand.500", boxShadow: "0 0 0 3px rgba(79,70,229,0.18)" },
          },
        },
      },
    },
    Code: {
      baseStyle: {
        bg: "brand.50",
        color: "brand.800",
        borderColor: "brand.100",
        border: "1px solid",
        borderRadius: "md",
        px: 1.5,
        py: 0.5,
        fontWeight: 500,
      },
    },
    Divider: {
      baseStyle: { borderColor: "surface.border", opacity: 1 },
    },
    Progress: {
      baseStyle: { track: { bg: "surface.panelAlt" } },
    },
    // ── Original EMS component styles (preserved) ───────────────
    Switch: {
      baseStyle: (props) => ({
        track: {
          bg: mode("custom.secondaryTextColor", "custom.secondaryTextColor")(props),
          _checked: {
            bg: mode("custom.lightModeGreen", "custom.darkModeGreen")(props),
          },
        },
      }),
    },
    Slider: {
      baseStyle: (props) => ({
        filledTrack: { bg: mode("custom.lightModeText", "custom.darkModeText")(props) },
        thumb: { bg: mode("custom.lightModeText", "custom.darkModeText")(props) },
        track: { bg: mode("custom.lightSecondaryText", "custom.darkSecondaryText")(props) },
      }),
    },
  },
});

export default theme;
