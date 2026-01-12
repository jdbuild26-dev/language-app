import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FullScreenLayout({ children }) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-auto flex flex-col">
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/vocabulary/practice")}
          className="rounded-full h-10 w-10 bg-white/10 hover:bg-white/20 border-0 backdrop-blur-md shadow-sm"
          title="Exit Practice"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Exit</span>
        </Button>
      </div>
      <div className="flex-1 w-full h-full">{children}</div>
    </div>
  );
}
