
import { useState } from "react";
import { useDeleteGroup } from "@/hooks/group-management";

/**
 * Hook for managing dialog states in the groups management section
 */
export const useDialogsState = (tourId: string, selectedGroupIndex: number | null, setSelectedGroupIndex: (index: number | null) => void) => {
  // Dialog states
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [isAssignGuideOpen, setIsAssignGuideOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Hooks for group operations
  const { deleteGroup, isDeleting } = useDeleteGroup(tourId);
  
  // Handlers for opening dialogs
  const openAddGroupDialog = () => {
    setIsAddGroupOpen(true);
  };
  
  const openEditGroupDialog = (groupIndex: number) => {
    setSelectedGroupIndex(groupIndex);
    setIsEditGroupOpen(true);
  };
  
  const openAssignGuideDialog = (groupIndex: number) => {
    setSelectedGroupIndex(groupIndex);
    setIsAssignGuideOpen(true);
  };
  
  const openDeleteDialog = () => {
    if (selectedGroupIndex !== null) {
      setIsDeleteDialogOpen(true);
    }
  };
  
  // Handle group deletion
  const handleDeleteGroup = async () => {
    if (selectedGroupIndex !== null) {
      await deleteGroup(selectedGroupIndex);
      setIsDeleteDialogOpen(false);
      setSelectedGroupIndex(null);
    }
  };

  return {
    // Dialog open states
    isAddGroupOpen,
    isEditGroupOpen,
    isAssignGuideOpen,
    isDeleteDialogOpen,
    
    // Dialog open handlers
    openAddGroupDialog,
    openEditGroupDialog,
    openAssignGuideDialog,
    openDeleteDialog,
    
    // Dialog control
    setIsAddGroupOpen,
    setIsEditGroupOpen,
    setIsAssignGuideOpen,
    setIsDeleteDialogOpen,
    
    // Delete handler
    handleDeleteGroup,
    isDeleting,
  };
};
