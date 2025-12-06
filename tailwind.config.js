/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--background)", // Fallback to background as popover var wasn't explicit in generic shadcn sometimes, but we defined it in CSS
          foreground: "var(--foreground)",
        },
        card: {
          DEFAULT: "var(--background)", // Using background for cards by default in this theme
          foreground: "var(--foreground)",
        },
        "brand-blue": {
          1: "var(--brand-blue-1)",
          2: "var(--brand-blue-2)",
          3: "var(--brand-blue-3)",
        },
        "brand-yellow": {
          1: "var(--brand-yellow-1)",
          2: "var(--brand-yellow-2)",
          3: "var(--brand-yellow-3)",
        },
        // Dark Mode Specific Tokens
        "body-dark": "var(--bg-body-dark)",
        "elevated-1": "var(--bg-elevated-1)",
        "elevated-2": "var(--bg-elevated-2)",
        "card-dark": "var(--bg-card-dark)",
        "primary-dark": "var(--text-primary-dark)",
        "secondary-dark": "var(--text-secondary-dark)",
        "muted-dark": "var(--text-muted-dark)",
        "subtle-dark": "var(--border-subtle-dark)",
        "strong-dark": "var(--border-strong-dark)",
        streak: "var(--accent-streak)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
