
import { GuideInfo } from "@/types/ventrata";

export interface GuideNameAndInfo {
  name: string;
  info: GuideInfo | null;
}

export interface GuideSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (guideId: string | null) => void;
  guides: any[];
  currentGuideId: string | null;
  tour: any;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
}
