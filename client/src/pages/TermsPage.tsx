import { Sparkles } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary/5 py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-heading font-bold">
              Terms of Service
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Last updated: January 2025
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-heading font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground mb-8">
              By accessing and using Vibecoded Apps, you accept and agree to be bound by the terms and
              provision of this agreement. If you do not agree to these Terms of Service, please do not
              use our service.
            </p>

            <h2 className="text-3xl font-heading font-bold mb-4">2. Use License</h2>
            <p className="text-muted-foreground mb-4">
              Permission is granted to temporarily access the applications on Vibecoded Apps for personal,
              non-commercial transitory viewing only. This is the grant of a license, not a transfer of title,
              and under this license you may not:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-8 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on Vibecoded Apps</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>

            <h2 className="text-3xl font-heading font-bold mb-4">3. User Content</h2>
            <p className="text-muted-foreground mb-8">
              Users who submit applications to our platform retain ownership of their content. By submitting
              content, you grant Vibecoded Apps a worldwide, non-exclusive, royalty-free license to use,
              reproduce, and display such content in connection with the service.
            </p>

            <h2 className="text-3xl font-heading font-bold mb-4">4. Disclaimer</h2>
            <p className="text-muted-foreground mb-8">
              The materials on Vibecoded Apps are provided on an 'as is' basis. Vibecoded Apps makes no
              warranties, expressed or implied, and hereby disclaims and negates all other warranties including,
              without limitation, implied warranties or conditions of merchantability, fitness for a particular
              purpose, or non-infringement of intellectual property or other violation of rights.
            </p>

            <h2 className="text-3xl font-heading font-bold mb-4">5. Limitations</h2>
            <p className="text-muted-foreground mb-8">
              In no event shall Vibecoded Apps or its suppliers be liable for any damages (including, without
              limitation, damages for loss of data or profit, or due to business interruption) arising out of
              the use or inability to use the materials on Vibecoded Apps.
            </p>

            <h2 className="text-3xl font-heading font-bold mb-4">6. Revisions</h2>
            <p className="text-muted-foreground mb-8">
              The materials appearing on Vibecoded Apps could include technical, typographical, or photographic
              errors. Vibecoded Apps does not warrant that any of the materials on its website are accurate,
              complete, or current. Vibecoded Apps may make changes to the materials contained on its website
              at any time without notice.
            </p>

            <h2 className="text-3xl font-heading font-bold mb-4">7. Contact Information</h2>
            <p className="text-muted-foreground">
              If you have any questions about these Terms of Service, please contact us through our support channels.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
