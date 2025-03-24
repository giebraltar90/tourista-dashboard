
import { useState, useEffect } from "react";
import { supabase, supabaseWithRetry } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { EventEmitter } from "@/utils/eventEmitter";
import { logger } from "@/utils/logger";

export interface GuideAssignment {
  groupId: string;
  guideId: string | null;
  guideName: string | null;
  groupIndex: number;
  groupName: string;
}

/**
 * Hook for caching and tracking guide assignments to ensure UI consistency
 */
export const useGuideAssignmentCache = (tourId: string) => {
  const [assignments, setAssignments] = useState<GuideAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  
  // Fetch initial assignments with improved error handling and retries
  const loadAssignments = async () => {
    if (!tourId) return;
    
    try {
      setIsLoading(true);
      
      // Use retry mechanism for more reliable loading
      const { data, error } = await supabaseWithRetry(async () => {
        return await supabase
          .from('tour_groups')
          .select('id, name, guide_id, guides(name, guide_type)')
          .eq('tour_id', tourId)
          .order('entry_time', { ascending: true });
      });
        
      if (error) {
        logger.error("Error loading guide assignments:", error);
        return;
      }
      
      if (!data) {
        setAssignments([]);
        return;
      }
      
      const processedAssignments = data.map((group, index) => {
        // Handle the guides object properly
        const guideName = group.guides ? group.guides.name : null;
                
        return {
          groupId: group.id,
          guideId: group.guide_id,
          guideName: guideName,
          groupIndex: index,
          groupName: group.name || `Group ${index + 1}`
        };
      });
      
      setAssignments(processedAssignments);
      logger.debug("Loaded guide assignments:", processedAssignments);
    } catch (err) {
      logger.error("Failed to load guide assignments:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update the cached assignments when guides change
  const updateAssignment = (groupId: string, guideId: string | null, guideName: string | null) => {
    setAssignments(current => 
      current.map(assignment => 
        assignment.groupId === groupId 
          ? { ...assignment, guideId, guideName }
          : assignment
      )
    );
  };
  
  // Listen for guide change events
  useEffect(() => {
    if (!tourId) return;
    
    // Load initial data
    loadAssignments();
    
    // Subscribe to guide change events
    const handleGuideChange = () => {
      logger.debug("Guide change event received, refreshing assignments");
      loadAssignments();
      
      // Invalidate queries that might need refreshing
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
    };
    
    EventEmitter.on(`guide-change:${tourId}`, handleGuideChange);
    
    // Clean up event listener
    return () => {
      EventEmitter.off(`guide-change:${tourId}`, handleGuideChange);
    };
  }, [tourId, queryClient]);
  
  return {
    assignments,
    isLoading,
    updateAssignment,
    refreshAssignments: loadAssignments
  };
};
