
import { TourCardProps } from "@/components/tours/tour-card/types";

export interface UseAssignGuideResult {
  assignGuide: (groupIdOrIndex: string | number, guideId: string) => Promise<boolean>;
  isAssigning: boolean;
  assignmentError: string | null;
}

export interface AssignGuideParams {
  tourId: string;
  groupIdOrIndex: string | number;
  guideId: string;
}
