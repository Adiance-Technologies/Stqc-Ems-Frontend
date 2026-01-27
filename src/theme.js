import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const config = {
  initialColorMode: "light",
  useSystemColorMode: true,
};

const theme = extendTheme({
  config,
  fonts: {
    heading:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
    body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
  },
  colors: {
    custom: {
      primary: "#C8D6E5", // You can use this for backgrounds, borders, etc.
      darkModePrimary: "#54637A", // You can use this for backgrounds, borders, etc.
      mobileLightNavBg: "#F4F4F5",
      mobileDarkNavBG: "#333333",
      lightModeText: "#1A1A1A", //Primary Light Mode Text
      darkModeText: "#FFFFFF", //Primary Dark Mode Text
      lightSecondaryText: "#4E5258",
      darkSecondaryText: "#A3AEBD",
      lightModeBg: "#FCFCFC",
      darkModeBg: "#231F1F",
      // secondary: '#C8D6E5', // A lighter color for backgrounds or highlights
      accent: "#5F4BB6", // A bold color for buttons or accents
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
  components: {
    Switch: {
      baseStyle: (props) => ({
        track: {
          bg: mode(
            "custom.secondaryTextColor",
            "custom.secondaryTextColor"
          )(props), // switch OFF
          _checked: {
            bg: mode("custom.lightModeGreen", "custom.darkModeGreen")(props), // switch ON
          },
        },
      }),
    },
    Slider: {
      baseStyle: (props) => ({
        filledTrack: {
          bg: mode("custom.lightModeText", "custom.darkModeText")(props),
        },
        thumb: {
          bg: mode("custom.lightModeText", "custom.darkModeText")(props),
        },
        track: {
          bg: mode(
            "custom.lightSecondaryText",
            "custom.darkSecondaryText"
          )(props),
        },
      }),
    },
  },
});

export default theme;
