module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  // purge: [".src/components/**/*.{js,ts,jsx,tsx}", ".src/pages/**/*.{js,ts,jsx,tsx}", ".src/layouts/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      display: ["Quicksand", "sans-serif"],
      body: ["Quicksand", "sans-serif"],
    },
    extend: {
      colors: {
        brand: {
          primary: "#F9A109",
          secondary: "#FFF0DE",
          accent: "#80485B",
          info: "#56CCF2",
        },
      },
    },
  },
  variants: {
    borderColor: ["responsive", "hover", "focus", "focus-within"],
    textColor: ["responsive", "hover", "focus", "focus-within"],
  },
  plugins: [],
};
