import { Link } from "react-router-dom";
import { LogoSVG } from "@/components/layout/header/NavbarIcons";

export default function RefundPolicy() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <LogoSVG />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              LangLearn
            </span>
          </Link>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Refund Policy
          </h1>
          <p className="mt-4 text-gray-500 dark:text-slate-400">
            Last updated: December 2024
          </p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Refund Eligibility
            </h2>
            <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
              At LangLearn, we want you to be completely satisfied with your
              purchase. If you are not satisfied with your subscription or
              purchase, you may be eligible for a refund under the following
              conditions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Subscription Refunds
            </h2>
            <p className="text-gray-600 dark:text-slate-300 leading-relaxed mb-4">
              For subscription-based purchases:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-slate-300 space-y-2">
              <li>Full refund available within 7 days of initial purchase</li>
              <li>Partial refunds may be available for annual subscriptions</li>
              <li>
                No refunds for monthly subscriptions after the billing period
                has started
              </li>
              <li>
                Refund requests must be submitted through our support portal
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. How to Request a Refund
            </h2>
            <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
              To request a refund, please contact our support team with your
              account email, order number, and reason for the refund request. We
              will process your request within 5-7 business days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. Processing Time
            </h2>
            <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
              Once approved, refunds will be processed to your original payment
              method within 5-10 business days. Please note that your bank may
              take additional time to reflect the refund in your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Contact Us
            </h2>
            <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
              For refund-related inquiries, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <p className="text-gray-700 dark:text-slate-300">
                <strong>LangLearn Inc.</strong>
                <br />
                Email: refunds@langlearn.com
                <br />
                Support Portal: support.langlearn.com
              </p>
            </div>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/"
            className="text-brand-blue-1 hover:text-brand-blue-2 font-medium transition-colors"
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
