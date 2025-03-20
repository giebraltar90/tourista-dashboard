
import { GuideInfo } from "@/types/ventrata";

export interface GuideOption {
  id: string;
  name: string;
  info: GuideInfo | null;
}

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
