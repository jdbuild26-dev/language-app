// Simplified useToast hook to fix build errors
// In a real app, you would implement a proper Toast Context or use a library like Sonner/HotToast

export function useToast() {
  return {
    toast: ({ title, description, variant }) => {
      console.log(`[TOAST] ${title}: ${description} (${variant})`);
      // Fallback for visual feedback if no UI component exists yet
      // alert(`${title}\n${description}`);
    },
    dismiss: (id) => console.log("Dismiss toast", id),
  };
}
