
import { useState, useCallback } from "react";
import { useDeleteGroup } from "@/hooks/group-management";

export const useDialogsState = (
  tourId: string,
  selectedGroupIndex: number | null, 
  setSelectedGroupIndex: (index: number | null) => void
) => {
  // Dialog states
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [isAssignGuideOpen, setIsAssignGuideOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Hooks for group operations
  const { deleteGroup, isDeleting } = useDeleteGroup(tourId);
  
  // Handlers for opening dialogs
  const openAddGroupDialog = useCallback(() => {
    setIsAddGroupOpen(true);
  }, []);
  
  const openEditGroupDialog = useCallback((groupIndex: number) => {
    setSelectedGroupIndex(groupIndex);
    setIsEditGroupOpen(true);
  }, [setSelectedGroupIndex]);
  
  const openAssignGuideDialog = useCallback((groupIndex: number) => {
    setSelectedGroupIndex(groupIndex);
    setIsAssignGuideOpen(true);
  }, [setSelectedGroupIndex]);
  
  const openDeleteDialog = useCallback(() => {
    if (selectedGroupIndex !== null) {
      setIsDeleteDialogOpen(true);
    }
  }, [selectedGroupIndex]);
  
  // Handle group deletion
  const handleDeleteGroup = useCallback(async () => {
    if (selectedGroupIndex !== null) {
      await deleteGroup(selectedGroupIndex);
      setIsDeleteDialogOpen(false);
      setSelectedGroupIndex(null);
    }
  }, [deleteGroup, selectedGroupIndex, setSelectedGroupIndex]);
  
  return {
    // Dialog states
    isAddGroupOpen,
    isEditGroupOpen,
    isAssignGuideOpen,
    isDeleteDialogOpen,
    
    // Dialog open handlers
    openAddGroupDialog,
    openEditGroupDialog,
    openAssignGuideDialog,
    openDeleteDialog,
    
    // Dialog state setters
    setIsAddGroupOpen,
    setIsEditGroupOpen,
    setIsAssignGuideOpen,
    setIsDeleteDialogOpen,
    
    // Delete handler
    handleDeleteGroup,
    isDeleting
  };
};
