
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createTestParticipants } from "./createParticipants";

/**
 * Creates test data for a specific tour
 */
export const createTestDataForTour = async (tourId: string) => {
  try {
    console.log("Creating test data for tour:", tourId);
    
    // First, get the tour groups
    const { data: tourGroups, error: groupsError } = await supabase
      .from('tour_groups')
      .select('id, name')
      .eq('tour_id', tourId);
      
    if (groupsError) {
      console.error("Error fetching tour groups:", groupsError);
      toast.error("Failed to fetch tour groups");
      return false;
    }
    
    if (!tourGroups || tourGroups.length === 0) {
      console.error("No tour groups found for this tour");
      toast.warning("No groups found for this tour");
      return false;
    }
    
    // Create test participants for these groups
    const participantsCreated = await createTestParticipants(tourGroups);
    
    if (participantsCreated && participantsCreated.length > 0) {
      toast.success(`Created ${participantsCreated.length} test participants`);
      return true;
    } else {
      toast.error("Failed to create test participants");
      return false;
    }
  } catch (error) {
    console.error("Error creating test data:", error);
    toast.error("Failed to create test data");
    return false;
  }
};

/**
 * Utility to generate test data for the current tour
 */
export const addTestParticipants = async (tourId: string) => {
  if (!tourId) {
    toast.error("Invalid tour ID");
    return;
  }
  
  toast.info("Adding test participants...");
  
  // Check if participants already exist
  const { data: existingParticipants, error: checkError } = await supabase
    .from('participants')
    .select('id')
    .limit(1);
    
  if (!checkError && existingParticipants && existingParticipants.length > 0) {
    // Participants already exist, ask if we should add more
    if (confirm("Participants already exist. Do you want to add more test participants?")) {
      await createTestDataForTour(tourId);
    }
    return;
  }
  
  // No participants exist, create them
  await createTestDataForTour(tourId);
  
  // Refresh the page
  window.dispatchEvent(new Event('refresh-participants'));
};
