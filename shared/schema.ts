import { z } from "zod";

// AI Tool schema
export const toolSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  shortDescription: z.string(),
  category: z.string(),
  pricing: z.string(),
  websiteUrl: z.string().url(),
  logoUrl: z.string().optional(),
  features: z.array(z.string()),
  tags: z.array(z.string()),
  badge: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  sourceDetailUrl: z.string().url().optional(),
  developer: z.string().optional(),
  documentationUrl: z.string().url().optional(),
  socialLinks: z.object({
    twitter: z.string().optional(),
    github: z.string().optional(),
    linkedin: z.string().optional(),
    discord: z.string().optional(),
  }).optional(),
  useCases: z.array(z.string()).optional(),
  screenshots: z.array(z.string()).optional(),
  pricingDetails: z.object({
    free: z.string().optional(),
    starter: z.string().optional(),
    pro: z.string().optional(),
    enterprise: z.string().optional(),
  }).optional(),
  launchDate: z.string().optional(),
  lastUpdated: z.string(),
});

export const insertToolSchema = toolSchema.omit({ id: true });

export type Tool = z.infer<typeof toolSchema>;
export type InsertTool = z.infer<typeof insertToolSchema>;
