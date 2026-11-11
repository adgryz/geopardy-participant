import { extendTheme } from "@chakra-ui/react";

const cranberry = {
  main: "#b5262f",
  50: "#fdecee",
  100: "#f8c9cd",
  200: "#ee9ba2",
  300: "#e16d77",
  400: "#d0434f",
  500: "#b5262f",
  600: "#9c1f28",
  700: "#821820",
  800: "#661219",
  900: "#4a0c12",
};

const gold = {
  main: "#e9c46a",
  50: "#fdf8ea",
  100: "#faedc8",
  200: "#f8e6b0",
  300: "#f1d58b",
  400: "#edcb78",
  500: "#e9c46a",
  600: "#d4a94a",
  700: "#b8892f",
  800: "#8f6a22",
  900: "#664b18",
};

const body = `"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;

const theme = extendTheme({
  colors: { primary: cranberry, secondary: gold },
  fonts: {
    heading: `"Fraunces", Georgia, serif`,
    body,
  },
  styles: {
    global: {
      body: { bg: "#07121e", color: "#f7f0e3" },
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "full",
        fontWeight: 700,
        letterSpacing: "0.03em",
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        _hover: { transform: "translateY(-2px)" },
        _active: { transform: "scale(0.97)" },
        _disabled: { transform: "none" },
      },
      sizes: {
        lg: { h: 14, px: 10, fontSize: "lg" },
      },
      variants: {
        solid: {
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow:
            "0 14px 28px -12px rgba(181, 38, 47, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.28)",
          _disabled: { boxShadow: "none" },
        },
      },
    },
    Input: {
      defaultProps: { size: "lg" },
      variants: {
        outline: {
          field: {
            borderRadius: "14px",
            bg: "rgba(247, 240, 227, 0.07)",
            borderColor: "rgba(247, 240, 227, 0.22)",
            color: "#f7f0e3",
            _placeholder: { color: "rgba(247, 240, 227, 0.5)" },
            _hover: { borderColor: "rgba(247, 240, 227, 0.4)" },
            _focusVisible: {
              borderColor: "#e9c46a",
              boxShadow: "0 0 0 1px #e9c46a",
            },
          },
        },
      },
    },
  },
});

export default theme;
