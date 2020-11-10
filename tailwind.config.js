module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: false,
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
