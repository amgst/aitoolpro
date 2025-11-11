import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink } from "lucide-react";
import type { Tool } from "@shared/schema";

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  return (
    <Card className="flex h-full flex-col hover-elevate transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-4">
        <div className="flex items-start gap-3">
          {tool.logoUrl ? (
            <img
              src={tool.logoUrl}
              alt={`${tool.name} logo`}
              className="h-12 w-12 rounded-md object-cover"
              data-testid={`img-logo-${tool.slug}`}
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
              <span className="text-lg font-bold">{tool.name.charAt(0)}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <Link href={`/tool/${tool.slug}`} data-testid={`link-tool-${tool.slug}`}>
              <h3 className="font-semibold text-lg leading-tight hover:text-primary transition-colors">
                {tool.name}
              </h3>
            </Link>
            {tool.developer && (
              <p className="text-sm text-muted-foreground">{tool.developer}</p>
            )}
          </div>
        </div>
        {tool.badge && (
          <Badge variant="secondary" className="shrink-0" data-testid={`badge-${tool.slug}`}>
            {tool.badge}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <p className="text-sm text-foreground line-clamp-2">
          {tool.shortDescription}
        </p>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" data-testid={`category-${tool.slug}`}>
            {tool.category}
          </Badge>
          <Badge variant="outline" data-testid={`pricing-${tool.slug}`}>
            {tool.pricing}
          </Badge>
        </div>

        {tool.rating && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm font-medium" data-testid={`rating-${tool.slug}`}>
              {tool.rating.toFixed(1)}
            </span>
          </div>
        )}

        {tool.features.length > 0 && (
          <ul className="space-y-1">
            {tool.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span className="flex-1">{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 pt-4">
        <Link href={`/tool/${tool.slug}`} className="flex-1" data-testid={`link-details-${tool.slug}`}>
          <Button variant="outline" className="w-full" data-testid={`button-details-${tool.slug}`}>
            View Details
          </Button>
        </Link>
        <Button
          variant="default"
          size="icon"
          onClick={() => window.open(tool.websiteUrl, '_blank')}
          data-testid={`button-visit-${tool.slug}`}
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
