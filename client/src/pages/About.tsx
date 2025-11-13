import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSEO } from "@/hooks/useSEO";

export default function About() {
  const [searchQuery, setSearchQuery] = useState("");

  useSEO({
    title: "About Us - AI Tools Directory",
    description: "Learn about AI Tools Directory - your comprehensive guide to discovering the best AI tools for your business needs.",
    url: typeof window !== "undefined" ? window.location.href : "",
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="flex-1 container mx-auto px-4 py-12 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">About AI Tools Directory</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-4">
            <section>
              <h2 className="text-2xl font-semibold mb-2">Our Mission</h2>
              <p className="text-muted-foreground">
                AI Tools Directory is dedicated to helping businesses and individuals discover the best 
                AI-powered tools available. We curate and organize thousands of AI tools across various 
                categories, making it easy for you to find the perfect solution for your needs.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-2">What We Do</h2>
              <p className="text-muted-foreground">
                We provide a comprehensive directory of AI tools, featuring:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Detailed tool descriptions and features</li>
                <li>Category-based organization for easy browsing</li>
                <li>Search functionality to find tools quickly</li>
                <li>Pricing information and use cases</li>
                <li>Direct links to tool websites</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-2">Our Commitment</h2>
              <p className="text-muted-foreground">
                We are committed to maintaining an up-to-date directory with accurate information about 
                each tool. Our goal is to be your trusted resource for discovering AI tools that can help 
                streamline your workflow and boost productivity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
              <p className="text-muted-foreground">
                Have a question or suggestion? We'd love to hear from you. Please reach out through our 
                website or social media channels.
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

