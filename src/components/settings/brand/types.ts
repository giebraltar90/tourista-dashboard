
import { z } from "zod";

// Form schema
export const logoFormSchema = z.object({
  logo: z.string().optional(),
});

export type LogoFormValues = z.infer<typeof logoFormSchema>;
