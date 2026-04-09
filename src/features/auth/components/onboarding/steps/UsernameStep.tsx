"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import StepHeader from "@/features/auth/components/onboarding/shared/StepHeader";
import StepNavigation from "@/features/auth/components/onboarding/shared/StepNavigation";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Validation: min 4 chars, at least 1 letter, only letters/numbers/underscores
function validateUsername(value: string): string | null {
  if (value.length < 4) return "At least 4 characters required";
  if (!/[a-zA-Z]/.test(value)) return "Must contain at least 1 letter";
  if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Only letters, numbers, and underscores allowed";
  return null;
}

export default function UsernameStep({ formData, setFormData, onBack, onContinue }) {
  const { getToken } = useAuth();
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const username = formData.username || "";

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const lower = username.toLowerCase();
    const validationError = validateUsername(lower);

    if (!lower) { setStatus("idle"); setErrorMsg(""); return; }
    if (validationError) { setStatus("invalid"); setErrorMsg(validationError); return; }

    setStatus("checking");
    debounceRef.current = setTimeout(async () => {
      try {
        const token = await getToken();
        const res = await fetch(
          `${API_URL}/api/students/check-username?username=${encodeURIComponent(lower)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setStatus(data.available ? "available" : "taken");
          setErrorMsg(data.available ? "" : "Username already taken");
        }
      } catch {
        setStatus("idle");
      }
    }, 500);
  }, [username]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Force lowercase, strip spaces
    const val = e.target.value.toLowerCase().replace(/\s/g, "");
    setFormData((prev) => ({ ...prev, username: val }));
  };

  const canContinue = status === "available";

  return (
    <div className="space-y-6">
      <StepHeader
        heading={`Nice to meet you, ${formData.name || "there"}!`}
        subtext="Pick a username so friends can find you. You can't change this later."
      />

      <div className="max-w-sm mx-auto space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Choose a username
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium select-none">@</span>
          <Input
            type="text"
            value={username}
            onChange={handleChange}
            placeholder="e.g. coollearner42"
            className="pl-7 text-center text-lg"
            autoFocus
            maxLength={30}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {status === "checking" && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
            {status === "available" && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
            {(status === "taken" || status === "invalid") && <XCircleIcon className="h-5 w-5 text-red-500" />}
          </div>
        </div>

        {/* Status message */}
        {status === "available" && (
          <p className="text-sm text-green-600 dark:text-green-400 text-center">@{username} is available!</p>
        )}
        {(status === "taken" || status === "invalid") && (
          <p className="text-sm text-red-500 text-center">{errorMsg}</p>
        )}
        {status === "idle" && username.length === 0 && (
          <p className="text-xs text-gray-400 text-center">Min 4 characters, at least 1 letter</p>
        )}
      </div>

      <StepNavigation
        onBack={onBack}
        onContinue={onContinue}
        continueDisabled={!canContinue}
      />
    </div>
  );
}
