import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSEO } from "@/hooks/useSEO";

export default function Terms() {
  const [searchQuery, setSearchQuery] = useState("");

  useSEO({
    title: "Terms of Service - AI Tools Directory",
    description: "Terms of Service for AI Tools Directory. Read our terms and conditions for using our platform.",
    url: typeof window !== "undefined" ? window.location.href : "",
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="flex-1 container mx-auto px-4 py-12 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-4">
            <section>
              <h2 className="text-2xl font-semibold mb-2">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using AI Tools Directory, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-2">2. Use License</h2>
              <p className="text-muted-foreground">
                Permission is granted to temporarily access the materials on AI Tools Directory for personal, 
                non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, 
                and under this license you may not:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to decompile or reverse engineer any software</li>
                <li>Remove any copyright or other proprietary notations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-2">3. Disclaimer</h2>
              <p className="text-muted-foreground">
                The materials on AI Tools Directory are provided on an 'as is' basis. We make no warranties, 
                expressed or implied, and hereby disclaim and negate all other warranties including, without 
                limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, 
                or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-2">4. Limitations</h2>
              <p className="text-muted-foreground">
                In no event shall AI Tools Directory or its suppliers be liable for any damages (including, 
                without limitation, damages for loss of data or profit, or due to business interruption) 
                arising out of the use or inability to use the materials on our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-2">5. Accuracy of Materials</h2>
              <p className="text-muted-foreground">
                The materials appearing on AI Tools Directory could include technical, typographical, or 
                photographic errors. We do not warrant that any of the materials on its website are accurate, 
                complete, or current.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-2">6. Links</h2>
              <p className="text-muted-foreground">
                We have not reviewed all of the sites linked to our website and are not responsible for the 
                contents of any such linked site. The inclusion of any link does not imply endorsement by us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-2">7. Modifications</h2>
              <p className="text-muted-foreground">
                We may revise these terms of service at any time without notice. By using this website you 
                are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-2">8. Contact Information</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us through our website.
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

