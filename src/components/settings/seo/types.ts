
import { z } from "zod";

// Form schema
export const seoFormSchema = z.object({
  ogImage: z.string().optional(),
  favicon: z.string().optional(),
});

export type SEOFormValues = z.infer<typeof seoFormSchema>;
