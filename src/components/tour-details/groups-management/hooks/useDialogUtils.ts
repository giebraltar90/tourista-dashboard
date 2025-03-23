
import { useState, useCallback } from "react";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";

/**
 * Custom hook to provide dialog utility functions
 */
export const useDialogUtils = (
  tour: TourCardProps,
  guide1Info?: GuideInfo | null,
  guide2Info?: GuideInfo | null,
  guide3Info?: GuideInfo | null,
  selectedGroupIndex?: number | null,
  setSelectedGroupIndex?: (index: number | null) => void
) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<string>("");

  // Open assign guide dialog
  const openAssignGuideDialog = useCallback((groupIndex: number) => {
    if (setSelectedGroupIndex) {
      setSelectedGroupIndex(groupIndex);
    }
    setDialogType("assignGuide");
    setIsDialogOpen(true);
  }, [setSelectedGroupIndex]);

  // Open add group dialog
  const openAddGroupDialog = useCallback(() => {
    setDialogType("addGroup");
    setIsDialogOpen(true);
  }, []);

  // Open edit group dialog
  const openEditGroupDialog = useCallback((groupIndex: number) => {
    if (setSelectedGroupIndex) {
      setSelectedGroupIndex(groupIndex);
    }
    setDialogType("editGroup");
    setIsDialogOpen(true);
  }, [setSelectedGroupIndex]);

  // Open delete group dialog
  const openDeleteGroupDialog = useCallback((groupIndex: number) => {
    if (setSelectedGroupIndex) {
      setSelectedGroupIndex(groupIndex);
    }
    setDialogType("deleteGroup");
    setIsDialogOpen(true);
  }, [setSelectedGroupIndex]);

  // Close any dialog
  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setTimeout(() => {
      setDialogType("");
      if (setSelectedGroupIndex) {
        setSelectedGroupIndex(null);
      }
    }, 300);
  }, [setSelectedGroupIndex]);

  return {
    isDialogOpen,
    dialogType,
    openAssignGuideDialog,
    openAddGroupDialog,
    openEditGroupDialog,
    openDeleteGroupDialog,
    closeDialog
  };
};
