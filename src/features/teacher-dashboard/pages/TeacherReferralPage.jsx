import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  GiftIcon,
  ClipboardDocumentCheckIcon,
  UserPlusIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

export default function TeacherReferralPage() {
  const { toast } = useToast();
  const TEACHER_REFERRAL_CODE = "TEACH-SARAH-2026";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(TEACHER_REFERRAL_CODE);
    toast({
      title: "Code Copied!",
      description: "Teacher referral code copied to clipboard.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-primary-dark">
          Refer Fellow Teachers
        </h1>
        <p className="text-lg text-gray-500 dark:text-secondary-dark">
          Invite other teachers to our platform and earn premium badges and
          visibility.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Your Code Section */}
        <Card className="bg-gradient-to-br from-brand-blue-1 to-brand-blue-2 text-white border-none shadow-lg transform hover:scale-[1.02] transition-transform">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <GiftIcon className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Your Referral Code</CardTitle>
            </div>
            <CardDescription className="text-blue-100">
              Share this code with your colleagues.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-2">
              <div className="flex-1 bg-white/10 backdrop-blur-md rounded-lg p-4 font-mono text-xl text-center tracking-wider border border-white/20 font-bold">
                {TEACHER_REFERRAL_CODE}
              </div>
              <Button
                onClick={handleCopyCode}
                className="h-auto bg-white text-brand-blue-1 hover:bg-blue-50 font-bold shadow-md"
              >
                <ClipboardDocumentCheckIcon className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex justify-between items-center text-sm font-medium pt-4 border-t border-white/20">
              <span>Referrals this month:</span>
              <span className="text-2xl font-bold">3</span>
            </div>
          </CardContent>
        </Card>

        {/* Benefits / Invite Section */}
        <Card>
          <CardHeader>
            <CardTitle>Why Refer?</CardTitle>
            <CardDescription>
              Unlock exclusive perks for every teacher who joins.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />{" "}
                {/* Needs CheckCircle from heroicons usually */}
                {/* Fallback to simple svg if icon issue */}
                <span className="text-green-600 font-bold">✓</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Verified Badge</p>
                <p className="text-sm text-gray-500">
                  Get a 'Verified' badge on your profile instantly.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-blue-600 font-bold">✓</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  Boosted Visibility
                </p>
                <p className="text-sm text-gray-500">
                  Appear at the top of student searches for 1 week.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <label className="text-sm font-medium mb-2 block">
                Invite by Email
              </label>
              <div className="flex gap-2">
                <Input placeholder="colleague@example.com" />
                <Button variant="outline">
                  <EnvelopeIcon className="w-4 h-4 mr-2" /> Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
