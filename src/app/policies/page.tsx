import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-gray-100">
      {/* Header */}
      <nav className="border-b border-gray-700">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-100 font-semibold text-lg hover:text-gray-300 transition-colors"
              >
                ∑otion
              </Link>
            </div>
            <Link
              href="/"
              className="inline-flex items-center text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Title */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-100">Privacy Policy</h1>
          <p className="text-gray-400">
            Last updated: {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Privacy Policy Content */}
        <div className="prose prose-gray max-w-none">

          {/* Introduction */}
          <section className="mb-8">
            <p className="text-lg text-gray-300 mb-6">
              Motion (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mathematical animation generation service.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-100">Information We Collect</h2>

            <h3 className="text-xl font-medium mb-3 text-gray-200">Google OAuth Information</h3>
            <p className="mb-4 text-gray-300">
              When you sign in with Google, we collect:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-300 space-y-1">
              <li>Your name</li>
              <li>Your email address</li>
              <li>Your Google profile picture</li>
              <li>Your Google account ID (for authentication purposes)</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 text-gray-200">Usage Information</h3>
            <p className="mb-4 text-gray-300">
              We collect information about how you use our service:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-300 space-y-1">
              <li>Animation prompts and descriptions you provide</li>
              <li>Generated videos and associated metadata</li>
              <li>Usage patterns and feature interactions</li>
              <li>Technical information (browser type, device information)</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-100">How We Use Your Information</h2>
            <p className="mb-4 text-gray-300">We use your information to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-300 space-y-1">
              <li>Provide and maintain our animation generation service</li>
              <li>Authenticate your account and ensure security</li>
              <li>Generate mathematical animations based on your prompts</li>
              <li>Store and organize your created content</li>
              <li>Improve our AI models and service quality</li>
              <li>Communicate with you about service updates</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* Data Sharing and Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-100">Data Sharing and Security</h2>

            <h3 className="text-xl font-medium mb-3 text-gray-200">Third-Party Sharing</h3>
            <p className="mb-4 text-gray-300">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in these limited circumstances:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-300 space-y-1">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
              <li>With service providers who help us operate our platform (under strict confidentiality agreements)</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 text-gray-200">Data Security</h3>
            <p className="mb-4 text-gray-300">
              We implement industry-standard security measures to protect your information, including encryption, secure authentication, and regular security audits.
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-100">Your Rights</h2>
            <p className="mb-4 text-gray-300">You have the right to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-300 space-y-1">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and associated data</li>
              <li>Export your created content</li>
              <li>Withdraw consent for data processing</li>
            </ul>
          </section>

          {/* Google OAuth Compliance */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-100">Google OAuth Integration</h2>
            <p className="mb-4 text-gray-300">
              Our use of Google OAuth complies with Google&apos;s API Services User Data Policy. We:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-300 space-y-1">
              <li>Only request the minimum necessary permissions</li>
              <li>Use your Google data solely for authentication and service provision</li>
              <li>Do not store unnecessary Google account information</li>
              <li>Provide transparent information about data usage</li>
              <li>Allow you to revoke access at any time through your Google account settings</li>
            </ul>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-100">Contact Us</h2>
            <p className="mb-4 text-gray-300">
              If you have questions about this Privacy Policy or your data, please contact us:
            </p>
            <ul className="list-none space-y-2 text-gray-300">
              <li><strong className="text-gray-200">Project:</strong> Motion</li>
              <li><strong className="text-gray-200">Email:</strong> <a href="mailto:manab.das.dev@gmail.com" className="text-blue-400 hover:text-blue-300 hover:underline">manab.das.dev@gmail.com</a></li>
              <li><strong className="text-gray-200">GitHub:</strong> <a href="https://github.com/manu-0990/motion" className="text-blue-400 hover:text-blue-300 hover:underline" target="_blank" rel="noopener noreferrer">https://github.com/manu-0990/motion</a></li>
              <li><strong className="text-gray-200">Issues:</strong> Report privacy concerns on our GitHub repository</li>
            </ul>
          </section>

          {/* Updates */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-100">Policy Updates</h2>
            <p className="text-gray-300">
              We may update this Privacy Policy from time to time. We will notify users of any material changes by updating the &quot;Last updated&quot; date at the top of this policy. Your continued use of our service after any changes constitutes acceptance of the updated policy.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
} 