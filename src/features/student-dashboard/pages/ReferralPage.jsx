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
  SparklesIcon,
} from "@heroicons/react/24/outline";

export default function ReferralPage() {
  const [referralCode, setReferralCode] = useState("");
  const { toast } = useToast();
  const MY_REFERRAL_CODE = "LNG-STUDENT-2026";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(MY_REFERRAL_CODE);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard.",
    });
  };

  const handleSubmitCode = (e) => {
    e.preventDefault();
    if (referralCode.trim().length > 0) {
      // Mock api call
      toast({
        title: "Success! 🎉",
        description: "Referral code applied. You earned 50 credits!",
        variant: "default",
      });
      setReferralCode("");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-primary-dark">
          Refer & Earn
        </h1>
        <p className="text-gray-500 dark:text-secondary-dark">
          Invite friends to join and earn credits for free practice tokens.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Your Code Section */}
        <Card className="bg-gradient-to-br from-brand-blue-1 to-brand-blue-2 text-white border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GiftIcon className="w-6 h-6 text-yellow-300" />
              Your Referral Code
            </CardTitle>
            <CardDescription className="text-blue-100">
              Share this code with friends. You both get 100 credits!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 bg-white/10 p-2 rounded-lg border border-white/20 backdrop-blur-sm">
              <code className="flex-1 font-mono text-xl font-bold text-center tracking-wider text-white">
                {MY_REFERRAL_CODE}
              </code>
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={handleCopyCode}
              >
                <ClipboardDocumentCheckIcon className="w-5 h-5" />
              </Button>
            </div>
            <div className="text-sm text-blue-100 flex justify-between items-center">
              <span>Total Earned:</span>
              <span className="font-bold text-lg text-yellow-300">
                250 Credits
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Enter Code Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlusIcon className="w-6 h-6 text-green-500" />
              Enter Friend's Code
            </CardTitle>
            <CardDescription>
              Have a code? Enter it here to claim your welcome bonus.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitCode} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Paste code here (e.g. LNG-XXXX)"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="font-mono uppercase placeholder:normal-case"
                />
                <Button type="submit" disabled={!referralCode}>
                  Apply
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                * Credits are automatically added to your balance upon
                verification.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Referral History */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-primary-dark mt-8">
        Referral History
      </h2>
      <Card>
        <CardContent className="p-0 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-card-dark text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Friend</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-subtle-dark">
              {[
                {
                  date: "2026-02-14",
                  friend: "Alex Johnson",
                  status: "Completed",
                  credits: 100,
                },
                {
                  date: "2026-02-10",
                  friend: "Maria Garcia",
                  status: "Completed",
                  credits: 100,
                },
                {
                  date: "2026-02-05",
                  friend: "John Doe",
                  status: "Pending",
                  credits: 50,
                },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-gray-900 dark:text-primary-dark">
                    {row.date}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-secondary-dark">
                    {row.friend}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        row.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-primary-dark">
                    +{row.credits}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
