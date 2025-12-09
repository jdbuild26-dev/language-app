import { Link } from "react-router-dom";
import { LogoSVG } from "@/components/layout/header/NavbarIcons";

export default function TermsConditions() {
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
            Terms & Conditions
          </h1>
          <p className="mt-4 text-gray-500 dark:text-slate-400">
            Last updated: December 2024
          </p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
              By accessing and using LangLearn's services, you accept and agree
              to be bound by the terms and provisions of this agreement. If you
              do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Use of Services
            </h2>
            <p className="text-gray-600 dark:text-slate-300 leading-relaxed mb-4">
              You agree to use our services only for lawful purposes and in
              accordance with these Terms. You agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-slate-300 space-y-2">
              <li>Use the service in any way that violates applicable laws</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Share your account credentials with others</li>
              <li>Reproduce, duplicate, or resell any part of our service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. User Accounts
            </h2>
            <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
              When you create an account with us, you must provide accurate on
              information. You are responsible for safeguarding your password
              and for all activities that occur under your account. You must
              notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. Intellectual Property
            </h2>
            <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
              The service and its original content, features, and functionality
              are owned by LangLearn Inc. and are protected by international
              copyright, trademark, patent, trade secret, and other intellectual
              property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Limitation of Liability
            </h2>
            <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
              In no event shall LangLearn Inc., nor its directors, employees,
              partners, agents, suppliers, or affiliates, be liable for any
              indirect, incidental, special, consequential, or punitive damages
              resulting from your use of the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. Contact Us
            </h2>
            <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <p className="text-gray-700 dark:text-slate-300">
                <strong>LangLearn Inc.</strong>
                <br />
                Email: legal@langlearn.com
                <br />
                Address: 123 Learning Street, Education City, EC 12345
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
