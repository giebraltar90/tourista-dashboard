
import { VentrataTourGroup } from "@/types/ventrata";
import { GuideInfo } from "@/types/ventrata";
import { GroupDialogsContainer } from "./dialogs/DialogsContainer";

interface GroupDialogsProps {
  tourId: string;
  tour: any;
  selectedGroupIndex: number | null;
  isAddGroupOpen: boolean;
  setIsAddGroupOpen: (open: boolean) => void;
  isEditGroupOpen: boolean;
  setIsEditGroupOpen: (open: boolean) => void;
  isAssignGuideOpen: boolean;
  setIsAssignGuideOpen: (open: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
  handleDeleteGroup: () => Promise<void>;
  isDeleting: boolean;
}

/**
 * Wrapper component for all group-related dialogs
 */
export const GroupDialogs = (props: GroupDialogsProps) => {
  // Simply pass all props to the container component
  return <GroupDialogsContainer {...props} />;
};
