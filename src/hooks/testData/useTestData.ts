
import { useState } from "react";
import { createCompleteTestData } from "./createTestData";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const useTestData = () => {
  const [isCreatingTestData, setIsCreatingTestData] = useState(false);
  const [isClearingTestData, setIsClearingTestData] = useState(false);
  const queryClient = useQueryClient();
  
  const createTestTours = async () => {
    try {
      setIsCreatingTestData(true);
      toast.info("Creating test data...");
      
      const result = await createCompleteTestData();
      
      if (result) {
        toast.success(`Created ${result.tours.length} tours with guides, groups, participants, and ticket buckets`);
        
        // Invalidate all related queries to refresh the UI
        queryClient.invalidateQueries({ queryKey: ['tours'] });
        queryClient.invalidateQueries({ queryKey: ['guides'] });
        
        return result;
      } else {
        toast.error("Failed to create test data");
        return null;
      }
    } catch (error) {
      console.error("Error creating test data:", error);
      toast.error("Failed to create test data: " + String(error));
      return null;
    } finally {
      setIsCreatingTestData(false);
    }
  };
  
  const clearTestData = async () => {
    try {
      setIsClearingTestData(true);
      toast.info("Clearing test data...");
      
      // Clear data in order of dependencies
      const tables = ['participants', 'tour_groups', 'tickets', 'modifications', 'ticket_buckets', 'tours', 'guides'] as const;
      
      for (const table of tables) {
        const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        
        if (error) {
          console.error(`Error clearing ${table}:`, error);
          toast.error(`Error clearing ${table}`);
          return false;
        }
      }
      
      toast.success("Test data cleared successfully");
      
      // Invalidate all related queries to refresh the UI
      queryClient.invalidateQueries();
      
      return true;
    } catch (error) {
      console.error("Error clearing test data:", error);
      toast.error("Failed to clear test data: " + String(error));
      return false;
    } finally {
      setIsClearingTestData(false);
    }
  };
  
  return {
    createTestTours,
    clearTestData,
    isCreatingTestData,
    isClearingTestData
  };
};
