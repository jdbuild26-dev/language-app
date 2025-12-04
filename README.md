# 🔐 Language App

A production-ready React web application with **Clerk authentication**, persistent sessions, and protected routes. Built with **React 18**, **TypeScript**, **Vite**, and **Tailwind CSS**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF)

---

## ✨ Features

- ✅ **Zero-backend authentication** - Fully functional using only Clerk
- ✅ **Persistent sessions** - Stay logged in across browser restarts
- ✅ **Protected routes** - Automatic redirect for unauthenticated users
- ✅ **Responsive design** - Beautiful UI on mobile, tablet, and desktop
- ✅ **Modern UI** - Glassmorphism effects, gradients, and smooth animations
- ✅ **TypeScript** - Full type safety throughout the codebase
- ✅ **Fast development** - Vite provides instant HMR and blazing-fast builds
- ✅ **Production-ready** - Deploy to Vercel, Netlify, or Cloudflare Pages in minutes

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** or **pnpm**
- **Clerk account** (free tier available at [clerk.com](https://clerk.com))

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/jdbuild26-dev/language-app.git
cd react-clerk-starter
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set Up Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Enable **Email** authentication (and optionally Google/GitHub)
4. Copy your **Publishable Key** from **API Keys** section

### 4. Configure Environment Variables

Create a \`.env\` file in the root directory:

\`\`\`bash
cp .env.example .env
\`\`\`

Edit \`.env\` and add your Clerk publishable key:

\`\`\`env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
\`\`\`

### 5. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

\`\`\`
react-clerk-starter/
├── public/ # Static assets
├── src/
│ ├── components/ # Reusable components
│ │ ├── Layout.tsx
│ │ ├── Navbar.tsx
│ │ └── ProtectedRoute.tsx
│ ├── pages/ # Page components
│ │ ├── Home.tsx
│ │ ├── Dashboard.tsx
│ │ ├── SignInPage.tsx
│ │ ├── SignUpPage.tsx
│ │ └── NotFound.tsx
│ ├── App.tsx # Main app with routing
│ ├── main.tsx # Entry point with ClerkProvider
│ └── index.css # Global styles + Tailwind
├── .env.example # Environment variables template
├── .gitignore
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
\`\`\`

---

## 🔑 Environment Variables

| Variable                       | Description                                   | Required |
| ------------------------------ | --------------------------------------------- | -------- |
| \`VITE_CLERK_PUBLISHABLE_KEY\` | Your Clerk publishable key from the dashboard | ✅ Yes   |

---

## 🎨 Tech Stack

| Technology       | Purpose        | Version |
| ---------------- | -------------- | ------- |
| **React**        | UI Framework   | 18.3+   |
| **TypeScript**   | Type Safety    | 5.x     |
| **Vite**         | Build Tool     | 5.x     |
| **Tailwind CSS** | Styling        | 3.4+    |
| **React Router** | Routing        | 6.26+   |
| **Clerk**        | Authentication | Latest  |

---

## 🛣️ Routes

| Route          | Access    | Description                              |
| -------------- | --------- | ---------------------------------------- |
| \`/\`          | Public    | Homepage with hero and features          |
| \`/sign-in\`   | Public    | Sign-in page (Clerk component)           |
| \`/sign-up\`   | Public    | Sign-up page (Clerk component)           |
| \`/dashboard\` | Protected | User dashboard (requires authentication) |
| \`/404\`       | Public    | Not found page                           |

---

## 🧪 Testing the Application

### Test Flow 1: First-Time User

1. Visit \`/\` → See homepage
2. Click **"Get Started"** → Redirected to \`/sign-up\`
3. Complete sign-up
4. Automatically redirected to \`/dashboard\`
5. See personalized welcome message

### Test Flow 2: Persistent Sessions

1. Sign in to the app
2. Close the browser completely
3. Reopen and visit the site
4. You should still be logged in ✅

### Test Flow 3: Protected Routes

1. While **logged out**, try to access \`/dashboard\`
2. You'll be automatically redirected to \`/sign-in\`
3. After signing in, you'll be redirected back to \`/dashboard\`

### Test Flow 4: Sign Out

1. Click your avatar in the navbar
2. Click **"Sign out"**
3. You'll be redirected to the homepage
4. Session is cleared ✅

---

## 🚢 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jdbuild26-dev/language-app)

1. Click the button above or visit [vercel.com](https://vercel.com)
2. Import your repository
3. Add environment variable: \`VITE_CLERK_PUBLISHABLE_KEY\`
4. Deploy! 🎉

### Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/jdbuild26-dev/language-app)

1. Click the button above or visit [netlify.com](https://netlify.com)
2. Connect your repository
3. Add environment variable: \`VITE_CLERK_PUBLISHABLE_KEY\`
4. Deploy! 🎉

### Build for Production

\`\`\`bash
npm run build
\`\`\`

The production-ready files will be in the \`dist/\` folder.

---

## 🎯 Key Features Explained

### 1. Persistent Sessions

Clerk uses **HTTP-only cookies** to maintain sessions. This means:

- Sessions survive page refreshes
- Sessions survive browser restarts
- No manual token management needed
- Secure by default (XSS protection)

### 2. Protected Routes

The \`ProtectedRoute\` component:

- Checks authentication status using Clerk's \`useAuth()\` hook
- Shows loading spinner while checking
- Redirects unauthenticated users to \`/sign-in\`
- Renders children if authenticated

### 3. Responsive Navbar

- Desktop: Full navigation with avatar dropdown
- Mobile: Hamburger menu with smooth animations
- Uses Clerk's \`<UserButton />\` for profile management

---

## 🔧 Customization

### Change Color Scheme

Edit \`tailwind.config.js\`:

\`\`\`js
theme: {
extend: {
colors: {
primary: {
500: '#your-color',
// ... more shades
}
}
}
}
\`\`\`

### Add Social Logins

1. Go to Clerk Dashboard → **User & Authentication** → **Social Connections**
2. Enable Google, GitHub, etc.
3. No code changes needed! Clerk handles it automatically.

### Customize Clerk Components

Edit the \`appearance\` prop in \`SignInPage.tsx\` or \`SignUpPage.tsx\`:

\`\`\`tsx
<SignIn
appearance={{
    elements: {
      card: "your-custom-class",
      // ... more customizations
    }
  }}
/>
\`\`\`

---

## 📚 Resources

- [Clerk Documentation](https://clerk.com/docs)
- [React Router Documentation](https://reactrouter.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)

---

## 🐛 Troubleshooting

### "Missing Clerk Publishable Key" Error

- Make sure you created a \`.env\` file
- Verify your key starts with \`pk*test*\` or \`pk*live*\`
- Restart the dev server after adding the key

### Styles Not Applying

- Ensure Tailwind CSS is properly configured
- Check that \`index.css\` imports are in \`main.tsx\`
- Clear browser cache and restart dev server

### Not Redirecting After Sign In

- Verify \`afterSignInUrl="/dashboard"\` in Clerk components
- Check that routes are configured correctly in \`App.tsx\`

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🌟 Show Your Support

If this project helped you, please give it a ⭐️!

---

## 👨‍💻 Author

Built with ❤️ by developers, for developers.

**Questions?** Open an issue or reach out!

---

## 📝 Changelog

### Version 1.0.0 (Nov 2025)

- ✅ Initial release
- ✅ Clerk authentication integration
- ✅ Protected routes
- ✅ Responsive design
- ✅ TypeScript support
- ✅ Production-ready deployment

---

**Happy Coding! 🚀**
