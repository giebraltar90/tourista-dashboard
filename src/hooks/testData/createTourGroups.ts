
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates test tour groups in the database
 */
export const createTestTourGroups = async (
  tourData: Array<{id: string}>,
  guideMap: Record<string, string>
) => {
  console.log("Creating test tour groups with proper UUID guide references...");
  
  // Create groups for each tour - using proper UUID references for guides
  let allGroups = [];
  
  // Tour 1: Two groups
  allGroups.push(
    {
      tour_id: tourData[0].id,
      name: "Noéma's Group",
      size: 6,
      entry_time: "9:10",
      child_count: 2,
      guide_id: guideMap["Noéma Weber"]  // This will be a proper UUID
    },
    {
      tour_id: tourData[0].id,
      name: "Jean's Group",
      size: 4,
      entry_time: "9:10",
      child_count: 1,
      guide_id: guideMap["Jean Dupont"]  // This will be a proper UUID
    }
  );
  
  // Tour 2: One private group
  allGroups.push(
    {
      tour_id: tourData[1].id,
      name: "Private Tour",
      size: 4,
      entry_time: "9:10",
      child_count: 0,
      guide_id: guideMap["Carlos Martinez"]  // This will be a proper UUID
    }
  );
  
  // Tour 3: One group
  allGroups.push(
    {
      tour_id: tourData[2].id,
      name: "Sophie's Group",
      size: 9,
      entry_time: "16:00",
      child_count: 0,
      guide_id: guideMap["Sophie Miller"]  // This will be a proper UUID
    }
  );
  
  // Tour 4: One VIP group
  allGroups.push(
    {
      tour_id: tourData[3].id,
      name: "VIP Group",
      size: 4,
      entry_time: "10:15",
      child_count: 0,
      guide_id: guideMap["Sophie Miller"]  // This will be a proper UUID
    }
  );
  
  // Tour 5: Two groups
  allGroups.push(
    {
      tour_id: tourData[4].id,
      name: "Group A",
      size: 12,
      entry_time: "14:00",
      child_count: 0,
      guide_id: guideMap["Jean Dupont"]  // This will be a proper UUID
    },
    {
      tour_id: tourData[4].id,
      name: "Group B",
      size: 10,
      entry_time: "14:15",
      child_count: 0
      // No guide assigned
    }
  );
  
  // Tour 6: Three groups
  allGroups.push(
    {
      tour_id: tourData[5].id,
      name: "Maria's Group",
      size: 8,
      entry_time: "8:30",
      child_count: 0,
      guide_id: guideMap["Maria Garcia"]  // This will be a proper UUID
    },
    {
      tour_id: tourData[5].id,
      name: "Tobias's Group",
      size: 8,
      entry_time: "8:45",
      child_count: 0,
      guide_id: guideMap["Tobias Schmidt"]  // This will be a proper UUID
    },
    {
      tour_id: tourData[5].id,
      name: "Third Group",
      size: 8,
      entry_time: "9:00",
      child_count: 0
      // No guide assigned
    }
  );
  
  // Tour 7: One group
  allGroups.push(
    {
      tour_id: tourData[6].id,
      name: "Group A",
      size: 3,
      entry_time: "16:15",
      child_count: 0,
      guide_id: guideMap["Maria Garcia"]  // This will be a proper UUID
    }
  );
  
  const { data: groupData, error: groupError } = await supabase
    .from('tour_groups')
    .insert(allGroups)
    .select();
    
  if (groupError) {
    console.error("Error creating tour groups:", groupError);
    throw groupError;
  }
  
  console.log("Created test tour groups with proper UUID references:", groupData);
  return groupData || [];
};
