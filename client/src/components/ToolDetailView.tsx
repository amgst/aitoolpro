import { Link } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowLeft, Star, Calendar, Github, Twitter, Linkedin } from "lucide-react";
import type { Tool } from "@shared/schema";

interface ToolDetailViewProps {
  tool: Tool;
}

export default function ToolDetailView({ tool }: ToolDetailViewProps) {
  return (
    <div className="container mx-auto px-4 py-8 lg:px-8">
      <Link href="/" data-testid="link-back">
        <Button variant="ghost" className="mb-6 gap-2" data-testid="button-back">
          <ArrowLeft className="h-4 w-4" />
          Back to Directory
        </Button>
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                {tool.logoUrl ? (
                  <img
                    src={tool.logoUrl}
                    alt={`${tool.name} logo`}
                    className="h-20 w-20 rounded-md object-cover"
                    data-testid="img-tool-logo"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <span className="text-3xl font-bold">{tool.name.charAt(0)}</span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h1 className="text-3xl font-semibold" data-testid="text-tool-name">
                        {tool.name}
                      </h1>
                      {tool.developer && (
                        <p className="text-muted-foreground" data-testid="text-developer">
                          by {tool.developer}
                        </p>
                      )}
                    </div>
                    {tool.badge && (
                      <Badge variant="secondary" data-testid="badge-tool">
                        {tool.badge}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground" data-testid="text-description">
                {tool.description}
              </p>

              {tool.features.length > 0 && (
                <div>
                  <h3 className="mb-3 font-semibold">Key Features</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {tool.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">✓</span>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tool.useCases && tool.useCases.length > 0 && (
                <div>
                  <h3 className="mb-3 font-semibold">Use Cases</h3>
                  <ul className="space-y-2">
                    {tool.useCases.map((useCase, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{useCase}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tool.tags.length > 0 && (
                <div>
                  <h3 className="mb-3 font-semibold">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tool.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {tool.screenshots && tool.screenshots.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Screenshots</h2>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {tool.screenshots.map((screenshot, index) => (
                    <img
                      key={index}
                      src={screenshot}
                      alt={`Screenshot ${index + 1}`}
                      className="rounded-md object-cover hover-elevate cursor-pointer transition-shadow"
                      data-testid={`img-screenshot-${index}`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Quick Info</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" data-testid="badge-category">
                  {tool.category}
                </Badge>
                <Badge variant="outline" data-testid="badge-pricing">
                  {tool.pricing}
                </Badge>
              </div>

              {tool.rating && (
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="font-medium" data-testid="text-rating">
                    {tool.rating.toFixed(1)} / 5.0
                  </span>
                </div>
              )}

              {tool.launchDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Launched {tool.launchDate}</span>
                </div>
              )}

              <div className="space-y-2 pt-4">
                <Button
                  className="w-full gap-2"
                  onClick={() => window.open(tool.websiteUrl, '_blank')}
                  data-testid="button-visit-website"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visit Website
                </Button>

                {tool.documentationUrl && (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => window.open(tool.documentationUrl, '_blank')}
                    data-testid="button-documentation"
                  >
                    Documentation
                  </Button>
                )}
              </div>

              {tool.socialLinks && (
                <div className="border-t pt-4">
                  <h3 className="mb-3 text-sm font-semibold">Connect</h3>
                  <div className="flex flex-wrap gap-2">
                    {tool.socialLinks.twitter && (
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => window.open(tool.socialLinks!.twitter, '_blank')}
                        data-testid="button-twitter"
                      >
                        <Twitter className="h-4 w-4" />
                      </Button>
                    )}
                    {tool.socialLinks.github && (
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => window.open(tool.socialLinks!.github, '_blank')}
                        data-testid="button-github"
                      >
                        <Github className="h-4 w-4" />
                      </Button>
                    )}
                    {tool.socialLinks.linkedin && (
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => window.open(tool.socialLinks!.linkedin, '_blank')}
                        data-testid="button-linkedin"
                      >
                        <Linkedin className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {tool.pricingDetails && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Pricing</h2>
              </CardHeader>
              <CardContent className="space-y-3">
                {tool.pricingDetails.free && (
                  <div>
                    <p className="font-medium">Free</p>
                    <p className="text-sm text-muted-foreground">{tool.pricingDetails.free}</p>
                  </div>
                )}
                {tool.pricingDetails.starter && (
                  <div>
                    <p className="font-medium">Starter</p>
                    <p className="text-sm text-muted-foreground">{tool.pricingDetails.starter}</p>
                  </div>
                )}
                {tool.pricingDetails.pro && (
                  <div>
                    <p className="font-medium">Pro</p>
                    <p className="text-sm text-muted-foreground">{tool.pricingDetails.pro}</p>
                  </div>
                )}
                {tool.pricingDetails.enterprise && (
                  <div>
                    <p className="font-medium">Enterprise</p>
                    <p className="text-sm text-muted-foreground">{tool.pricingDetails.enterprise}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
