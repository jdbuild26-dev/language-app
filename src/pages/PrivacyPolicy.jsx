import { Link } from "react-router-dom";
import { LogoSVG } from "@/components/navbar/NavbarIcons";

export default function PrivacyPolicy() {
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
            Privacy Policy
          </h1>
          <p className="mt-4 text-gray-500 dark:text-slate-400">
            Last updated: December 2024
          </p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
              Welcome to LangLearn. We are committed to protecting your personal
              information and your right to privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you use our language learning platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Information We Collect
            </h2>
            <p className="text-gray-600 dark:text-slate-300 leading-relaxed mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-slate-300 space-y-2">
              <li>Account information (name, email address, password)</li>
              <li>
                Profile information (language preferences, learning goals)
              </li>
              <li>Learning progress and activity data</li>
              <li>Communication data when you contact us</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
              We use the information we collect to provide, maintain, and
              improve our services, to personalize your learning experience, to
              communicate with you about updates and promotions, and to ensure
              the security of our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. Data Security
            </h2>
            <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
              We implement appropriate technical and organizational security
              measures to protect your personal data against unauthorized
              access, alteration, disclosure, or destruction. However, no method
              of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Contact Us
            </h2>
            <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
              If you have any questions about this Privacy Policy, please
              contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <p className="text-gray-700 dark:text-slate-300">
                <strong>LangLearn Inc.</strong>
                <br />
                Email: privacy@langlearn.com
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
