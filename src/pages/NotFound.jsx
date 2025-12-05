import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="text-center animate-fade-in">
        <div className="mb-8">
          <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-blue-1 to-brand-blue-2">
            404
          </h1>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
          Page Not Found
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button
            size="lg"
            className="rounded-full bg-brand-blue-1 hover:bg-brand-blue-2 text-white gap-2 px-8"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
