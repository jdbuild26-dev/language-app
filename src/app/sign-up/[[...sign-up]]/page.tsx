import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-body-dark">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-primary-dark tracking-tight">
            Create Your Account
          </h2>
          <p className="text-gray-500 dark:text-secondary-dark mt-2">
            Start your language learning journey today
          </p>
        </div>

        <style>{`
          .cl-formFieldRow:has(input[name="firstName"]) .cl-formFieldHintText,
          .cl-formFieldRow:has(input[name="lastName"]) .cl-formFieldHintText {
            display: none !important;
          }
        `}</style>
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-white shadow-xl border border-gray-100 rounded-2xl mx-auto",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              formButtonPrimary:
                "bg-brand-blue-1 hover:bg-brand-blue-2 text-white shadow-none",
              footerActionLink: "text-brand-blue-1 hover:text-brand-blue-2",
              formFieldInput:
                "border-gray-200 focus:border-brand-blue-1 focus:ring-brand-blue-1",
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl="/dashboard"
        />

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-gray-500 hover:text-brand-blue-1 transition-colors"
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
