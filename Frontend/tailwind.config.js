export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"], // Ensure Tailwind scans your files
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")], // Add the typography plugin
};
