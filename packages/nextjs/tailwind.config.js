/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("daisyui")],
  darkTheme: "scaffoldEthDark",
  // DaisyUI theme colors
  daisyui: {
    themes: [
      {
        scaffoldEth: {
          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
    ],
  },
  theme: {
    extend: {
      dropShadow: {
        glow: [
          "0 0px 20px rgba(255,255, 255, 0.35)",
          "0 0px 65px rgba(255, 255,255, 0.2)"
        ]
      },

      animation: {
        marquee: 'marquee 306s linear infinite',
        marquee2: 'marquee2 306s linear infinite',
        bounce: 'bounce 30s ease-in-out infinite',
      },
      keyframes: {
        bounce2: {
          '0%': {
            transform: 'translateY(0)'
          },
          '50%': {
            transform: 'translateY(-1%)'
          },
          '100%': {
            transform: 'translateY(0)'
          },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-15000%)' },
        },
        marquee2: {
          '0%': { transform: 'translateX(-15000%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        backgroundImage: {
          mmori: "url('/mmoriball.png')",
        },
        boxShadow: {
          center: "0 0 12px -2px rgb(0 0 0 / 0.05)",
        },
        animation: {
          "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        },
      },
    },
  },
};
