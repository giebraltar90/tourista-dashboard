
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types for guide and tour tables
export type GuideType = 'GA Ticket' | 'GA Free' | 'GC';
export type TourType = 'food' | 'private' | 'default';
export type ModificationStatus = 'pending' | 'complete';

/**
 * Clear all test data from the database
 */
export const clearAllTestData = async () => {
  try {
    console.log("Clearing all test data...");
    
    // Delete records in the correct order to respect foreign key constraints
    // 1. First delete participants as they depend on tour_groups
    const { error: participantsError } = await supabase
      .from('participants')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all participants
      
    if (participantsError) {
      console.error("Error deleting participants:", participantsError);
      toast.error("Failed to delete participants");
    }
    
    // 2. Delete tickets as they depend on tours
    const { error: ticketsError } = await supabase
      .from('tickets')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all tickets
      
    if (ticketsError) {
      console.error("Error deleting tickets:", ticketsError);
      toast.error("Failed to delete tickets");
    }
    
    // 3. Delete modifications as they depend on tours
    const { error: modificationsError } = await supabase
      .from('modifications')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all modifications
      
    if (modificationsError) {
      console.error("Error deleting modifications:", modificationsError);
      toast.error("Failed to delete modifications");
    }
    
    // 4. Delete tour_groups as they depend on tours and guides
    const { error: groupsError } = await supabase
      .from('tour_groups')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all groups
      
    if (groupsError) {
      console.error("Error deleting tour groups:", groupsError);
      toast.error("Failed to delete tour groups");
    }
    
    // 5. Delete tours as they may have foreign key constraints
    const { error: toursError } = await supabase
      .from('tours')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all tours
      
    if (toursError) {
      console.error("Error deleting tours:", toursError);
      toast.error("Failed to delete tours");
    }
    
    // 6. Finally delete guides
    const { error: guidesError } = await supabase
      .from('guides')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all guides
      
    if (guidesError) {
      console.error("Error deleting guides:", guidesError);
      toast.error("Failed to delete guides");
    }
    
    console.log("Successfully cleared all test data");
    return true;
  } catch (error) {
    console.error("Error clearing test data:", error);
    return false;
  }
};

/**
 * Generate a unique ID for test data
 */
export const generateTestId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
