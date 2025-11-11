import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertToolSchema, type InsertTool } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";

// Form schema that accepts strings for features and tags
const formSchema = insertToolSchema.extend({
  features: z.union([z.array(z.string()), z.string()]),
  tags: z.union([z.array(z.string()), z.string()]),
});

type FormData = z.infer<typeof formSchema>;

interface ToolFormProps {
  initialData?: Partial<InsertTool>;
  onSubmit: (data: InsertTool) => void;
  submitLabel?: string;
}

export default function ToolForm({ initialData, onSubmit, submitLabel = "Save Tool" }: ToolFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      slug: "",
      name: "",
      description: "",
      shortDescription: "",
      category: "",
      pricing: "",
      websiteUrl: "",
      logoUrl: "",
      features: "",
      tags: "",
      lastUpdated: new Date().toISOString().split('T')[0],
    },
  });

  const handleSubmit = (data: FormData) => {
    const features = typeof data.features === 'string' 
      ? data.features.split(',').map(f => f.trim()).filter(Boolean)
      : data.features;
    
    const tags = typeof data.tags === 'string'
      ? data.tags.split(',').map(t => t.trim()).filter(Boolean)
      : data.tags;

    onSubmit({ ...data, features, tags } as InsertTool);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tool Name</FormLabel>
                  <FormControl>
                    <Input placeholder="ChatGPT" {...field} data-testid="input-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug (URL-friendly name)</FormLabel>
                  <FormControl>
                    <Input placeholder="chatgpt" {...field} data-testid="input-slug" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Input placeholder="AI assistant for writing and coding" {...field} data-testid="input-short-description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed description of the tool..."
                      className="min-h-32"
                      {...field}
                      data-testid="input-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Content Creation" {...field} data-testid="input-category" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pricing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pricing</FormLabel>
                    <FormControl>
                      <Input placeholder="Freemium" {...field} data-testid="input-pricing" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="websiteUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} data-testid="input-website-url" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/logo.png" {...field} data-testid="input-logo-url" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="developer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Developer (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Company name" {...field} data-testid="input-developer" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features & Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="features"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Features (comma-separated)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Natural language processing, Code generation, Content writing"
                      {...field}
                      value={typeof field.value === 'string' ? field.value : (field.value || []).join(', ')}
                      onChange={(e) => field.onChange(e.target.value)}
                      data-testid="input-features"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (comma-separated)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="AI, Writing, Coding"
                      {...field}
                      value={typeof field.value === 'string' ? field.value : (field.value || []).join(', ')}
                      onChange={(e) => field.onChange(e.target.value)}
                      data-testid="input-tags"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" data-testid="button-submit">
            {submitLabel}
          </Button>
          <Button type="button" variant="outline" onClick={() => form.reset()} data-testid="button-reset">
            Reset
          </Button>
        </div>
      </form>
    </Form>
  );
}
