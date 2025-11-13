import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSEO } from "@/hooks/useSEO";

export default function Privacy() {
  const [searchQuery, setSearchQuery] = useState("");

  useSEO({
    title: "Privacy Policy - AI Tools Directory",
    description: "Privacy Policy for AI Tools Directory. Learn how we collect, use, and protect your personal information.",
    url: typeof window !== "undefined" ? window.location.href : "",
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="flex-1 container mx-auto px-4 py-12 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-4">
            <section>
              <h2 className="text-2xl font-semibold mb-2">1. Information We Collect</h2>
              <p className="text-muted-foreground">
                We collect information that you provide directly to us, such as when you search for tools, 
                browse categories, or interact with our website. This may include search queries, page views, 
                and navigation patterns.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-2">2. How We Use Your Information</h2>
              <p className="text-muted-foreground">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Analyze usage patterns to enhance user experience</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Detect and prevent fraud or abuse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-2">3. Cookies and Tracking</h2>
              <p className="text-muted-foreground">
                We use cookies and similar tracking technologies to track activity on our website and hold 
                certain information. You can instruct your browser to refuse all cookies or to indicate when 
                a cookie is being sent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-2">4. Third-Party Services</h2>
              <p className="text-muted-foreground">
                Our website may contain links to third-party websites or services. We are not responsible 
                for the privacy practices of these third parties. We encourage you to read their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-2">5. Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate security measures to protect your personal information. However, 
                no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-2">6. Your Rights</h2>
              <p className="text-muted-foreground">
                You have the right to access, update, or delete your personal information. If you have any 
                questions about this Privacy Policy, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-2">7. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any changes by 
                posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-2">8. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us through our website.
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

