import { Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary/5 py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-heading font-bold">
              Privacy Policy
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Last updated: January 2025
          </p>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-heading font-bold mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground mb-4">
              We collect information that you provide directly to us, including when you:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-8 space-y-2">
              <li>Create an account on Resonance</li>
              <li>Submit an application to our platform</li>
              <li>Rate or review applications</li>
              <li>Communicate with us through support channels</li>
            </ul>

            <h2 className="text-3xl font-heading font-bold mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-8 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process and complete transactions</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze trends, usage, and activities</li>
            </ul>

            <h2 className="text-3xl font-heading font-bold mb-4">3. Information Sharing</h2>
            <p className="text-muted-foreground mb-8">
              We do not share, sell, or rent your personal information to third parties for their marketing
              purposes without your explicit consent. We may share your information in the following circumstances:
              with your consent, to comply with laws, to respond to lawful requests and legal process, to protect
              rights and safety, and in connection with a business transfer.
            </p>

            <h2 className="text-3xl font-heading font-bold mb-4">4. Data Security</h2>
            <p className="text-muted-foreground mb-8">
              We take reasonable measures to help protect your personal information from loss, theft, misuse,
              unauthorized access, disclosure, alteration, and destruction. However, no security system is
              impenetrable and we cannot guarantee the security of our systems.
            </p>

            <h2 className="text-3xl font-heading font-bold mb-4">5. Cookies and Tracking</h2>
            <p className="text-muted-foreground mb-8">
              We use cookies and similar tracking technologies to track activity on our service and hold
              certain information. Cookies are files with a small amount of data which may include an
              anonymous unique identifier. You can instruct your browser to refuse all cookies or to
              indicate when a cookie is being sent.
            </p>

            <h2 className="text-3xl font-heading font-bold mb-4">6. Your Rights</h2>
            <p className="text-muted-foreground mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-8 space-y-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Object to processing of your personal information</li>
              <li>Request restriction of processing your personal information</li>
            </ul>

            <h2 className="text-3xl font-heading font-bold mb-4">7. Children's Privacy</h2>
            <p className="text-muted-foreground mb-8">
              Our service is not directed to children under the age of 13. We do not knowingly collect
              personally identifiable information from children under 13. If you are a parent or guardian
              and you are aware that your child has provided us with personal information, please contact us.
            </p>

            <h2 className="text-3xl font-heading font-bold mb-4">8. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground mb-8">
              We may update our Privacy Policy from time to time. We will notify you of any changes by
              posting the new Privacy Policy on this page and updating the "Last updated" date at the top
              of this Privacy Policy.
            </p>

            <h2 className="text-3xl font-heading font-bold mb-4">9. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy, please contact us through our support channels.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
