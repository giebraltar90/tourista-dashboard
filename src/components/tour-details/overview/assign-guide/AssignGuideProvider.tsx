
import { useState, useEffect, createContext, useContext } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAssignGuide } from "@/hooks/group-management";

interface AssignGuideContextProps {
  isGuideAssigned: boolean;
  isAssigning: boolean;
  localGuideId: string;
  handleAssignGuide: (selectedGuideId: string) => Promise<void>;
  guides: Array<{
    id: string;
    name: string;
    info: any;
  }>;
  displayName: string;
}

interface AssignGuideProviderProps {
  tourId: string;
  guideId: string;
  guideName?: string;
  groupIndex: number;
  guides: Array<{
    id: string;
    name: string;
    info: any;
  }>;
  displayName: string;
  children: React.ReactNode;
}

const AssignGuideContext = createContext<AssignGuideContextProps | null>(null);

export function AssignGuideProvider({
  tourId,
  guideId,
  guideName,
  groupIndex,
  guides,
  displayName,
  children
}: AssignGuideProviderProps) {
  const [isAssigning, setIsAssigning] = useState(false);
  const { assignGuide } = useAssignGuide(tourId);
  const queryClient = useQueryClient();
  
  // Track local selected guide for immediate UI updates
  const [localGuideId, setLocalGuideId] = useState(guideId);
  
  // Update local state when props change
  useEffect(() => {
    if (guideId !== localGuideId) {
      setLocalGuideId(guideId);
    }
  }, [guideId]);
  
  const isGuideAssigned = !!guideName && guideName !== "Unassigned";
  
  const handleAssignGuide = async (selectedGuideId: string) => {
    // If selecting the same guide, just return
    if (selectedGuideId === localGuideId) return;
    
    try {
      setIsAssigning(true);
      
      // Update local state immediately for responsive UI
      setLocalGuideId(selectedGuideId);
      
      // Cancel any current queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['tour', tourId] });
      
      const success = await assignGuide(groupIndex, selectedGuideId);
      
      if (success) {
        // Force invalidate all related queries to ensure UI consistency across the app
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
          queryClient.invalidateQueries({ queryKey: ['tours'] });
        }, 500);
      } else {
        // If failed, revert the local state
        setLocalGuideId(guideId);
        toast.error("Failed to assign guide");
      }
    } catch (error) {
      console.error("Error assigning guide:", error);
      // Revert local state on error
      setLocalGuideId(guideId);
      toast.error("Failed to assign guide");
    } finally {
      setIsAssigning(false);
    }
  };

  const value: AssignGuideContextProps = {
    isGuideAssigned,
    isAssigning,
    localGuideId,
    handleAssignGuide,
    guides,
    displayName
  };

  return (
    <AssignGuideContext.Provider value={value}>
      {children}
    </AssignGuideContext.Provider>
  );
}

// Add useContext as a static method on the provider component
AssignGuideProvider.useContext = function useAssignGuideContext() {
  const context = useContext(AssignGuideContext);
  if (!context) {
    throw new Error('useAssignGuideContext must be used within an AssignGuideProvider');
  }
  return context;
};
