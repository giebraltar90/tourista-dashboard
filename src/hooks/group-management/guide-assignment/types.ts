
import { z } from "zod";
import { GuideOption } from "../types";

// Define form schema with Zod
export const formSchema = z.object({
  guideId: z.string().optional(),
});

export interface FormValues {
  guideId?: string;
}

export interface UseGuideAssignmentFormProps {
  tourId: string;
  groupIndex: number;
  guides: GuideOption[];
  currentGuideId?: string;
  onSuccess: () => void;
  tour?: any;
}

export interface UseGuideAssignmentFormResult {
  form: any;
  isSubmitting: boolean;
  handleSubmit: (values: FormValues) => Promise<void>;
  handleRemoveGuide: () => Promise<void>;
  hasChanges: boolean;
  hasCurrentGuide: boolean;
}
