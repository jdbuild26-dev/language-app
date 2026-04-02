// Chat is full-screen — bypass the parent AIPracticeLayout tab bar
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
