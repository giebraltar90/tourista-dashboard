
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createTestGuides } from "./createGuides";
import { createTestTours } from "./createTours";
import { createTestTourGroups } from "./createTourGroups";
import { createTestModifications } from "./createModifications";
import { createTestTickets } from "./createTickets";
import { createTestParticipants } from "./createParticipants";

/**
 * Creates complete test data for a specific tour
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
 * Creates a complete set of test data with proper relationships
 */
export const createCompleteTestData = async () => {
  try {
    console.log("Creating complete test data set...");
    
    // Step 1: Create test guides
    const guides = await createTestGuides();
    
    if (!guides || guides.length === 0) {
      console.error("Failed to create test guides");
      return null;
    }
    
    // Create a map of guide names to IDs for easier reference
    const guideMap = guides.reduce((map, guide) => {
      map[guide.name] = guide.id;
      return map;
    }, {});
    
    console.log("Created guide map:", guideMap);
    
    // Step 2: Create test tours
    const tours = await createTestTours(guideMap);
    
    if (!tours || tours.length === 0) {
      console.error("Failed to create test tours");
      return null;
    }
    
    // Step 3: Create test tour groups
    const groups = await createTestTourGroups(tours, guideMap);
    
    if (!groups || groups.length === 0) {
      console.error("Failed to create test tour groups");
      return null;
    }
    
    // Step 4: Create test participants for the groups
    const participants = await createTestParticipants(groups);
    
    // Step 5: Create test tickets and modifications
    const tickets = await createTestTickets(tours);
    const modifications = await createTestModifications(tours);
    
    return {
      guides,
      tours,
      groups,
      participants,
      tickets,
      modifications
    };
  } catch (error) {
    console.error("Error creating complete test data:", error);
    return null;
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
