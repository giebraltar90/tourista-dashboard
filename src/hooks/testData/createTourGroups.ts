
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_CAPACITY_SETTINGS } from "@/types/ventrata";

/**
 * Creates test tour groups in the database
 * Now follows business rules for group distribution
 */
export const createTestTourGroups = async (
  tourData: Array<{id: string}>,
  guideMap: Record<string, string>
) => {
  console.log("Creating test tour groups with proper UUID guide references...");
  
  // Get capacity thresholds from the app settings
  const standardGroupThreshold = Math.ceil(DEFAULT_CAPACITY_SETTINGS.standard / DEFAULT_CAPACITY_SETTINGS.standardGroups);
  const highSeasonGroupThreshold = Math.ceil(DEFAULT_CAPACITY_SETTINGS.highSeason / DEFAULT_CAPACITY_SETTINGS.highSeasonGroups);
  
  console.log(`Using group thresholds: standard=${standardGroupThreshold}, highSeason=${highSeasonGroupThreshold}`);
  
  // Create groups for each tour - using proper UUID references for guides
  let allGroups = [];
  
  // Tour 1: Two groups based on threshold (standard tour)
  const tour1TotalParticipants = 10;
  if (tour1TotalParticipants <= standardGroupThreshold) {
    // If total is under threshold, create just one group
    allGroups.push({
      tour_id: tourData[0].id,
      name: "Group 1",
      size: tour1TotalParticipants,
      entry_time: "9:10",
      child_count: 2,
      guide_id: guideMap["Noéma Weber"]
    });
  } else {
    // If over threshold, create two balanced groups
    const group1Size = Math.ceil(tour1TotalParticipants / 2);
    const group2Size = tour1TotalParticipants - group1Size;
    
    allGroups.push(
      {
        tour_id: tourData[0].id,
        name: "Group 1",
        size: group1Size,
        entry_time: "9:10",
        child_count: 1,
        guide_id: guideMap["Noéma Weber"]
      },
      {
        tour_id: tourData[0].id,
        name: "Group 2",
        size: group2Size,
        entry_time: "9:10",
        child_count: 1,
        guide_id: guideMap["Jean Dupont"]
      }
    );
  }
  
  // Tour 2: One private group (small size, under threshold)
  allGroups.push(
    {
      tour_id: tourData[1].id,
      name: "Group 1",
      size: 4,
      entry_time: "9:10",
      child_count: 0,
      guide_id: guideMap["Carlos Martinez"]
    }
  );
  
  // Tour 3: One or two groups based on participant count
  const tour3TotalParticipants = 9;
  if (tour3TotalParticipants <= standardGroupThreshold) {
    // Under threshold, one group
    allGroups.push(
      {
        tour_id: tourData[2].id,
        name: "Group 1",
        size: tour3TotalParticipants,
        entry_time: "16:00",
        child_count: 0,
        guide_id: guideMap["Sophie Miller"]
      }
    );
  } else {
    // Over threshold, split into two groups
    const group1Size = Math.ceil(tour3TotalParticipants / 2);
    const group2Size = tour3TotalParticipants - group1Size;
    
    allGroups.push(
      {
        tour_id: tourData[2].id,
        name: "Group 1",
        size: group1Size,
        entry_time: "16:00",
        child_count: 0,
        guide_id: guideMap["Sophie Miller"]
      },
      {
        tour_id: tourData[2].id,
        name: "Group 2",
        size: group2Size,
        entry_time: "16:15",
        child_count: 0,
        guide_id: null // No guide assigned to second group
      }
    );
  }
  
  // Tour 4: One VIP group (small size, under threshold)
  allGroups.push(
    {
      tour_id: tourData[3].id,
      name: "Group 1",
      size: 4,
      entry_time: "10:15",
      child_count: 0,
      guide_id: guideMap["Sophie Miller"]
    }
  );
  
  // Tour 5: Two groups because total exceeds threshold
  const tour5TotalParticipants = 22;
  // Since 22 > standardGroupThreshold, create two groups
  const tour5Group1Size = Math.ceil(tour5TotalParticipants / 2);
  const tour5Group2Size = tour5TotalParticipants - tour5Group1Size;
  
  allGroups.push(
    {
      tour_id: tourData[4].id,
      name: "Group 1",
      size: tour5Group1Size,
      entry_time: "14:00",
      child_count: 0,
      guide_id: guideMap["Jean Dupont"]
    },
    {
      tour_id: tourData[4].id,
      name: "Group 2",
      size: tour5Group2Size,
      entry_time: "14:15",
      child_count: 0,
      guide_id: null // No guide assigned
    }
  );
  
  // Tour 6: High season tour with more participants, will have three groups
  const tour6TotalParticipants = 24;
  // For high season, we use highSeasonGroupThreshold and create 3 groups
  const tour6GroupSize = Math.ceil(tour6TotalParticipants / 3);
  
  allGroups.push(
    {
      tour_id: tourData[5].id,
      name: "Group 1",
      size: tour6GroupSize,
      entry_time: "8:30",
      child_count: 0,
      guide_id: guideMap["Maria Garcia"]
    },
    {
      tour_id: tourData[5].id,
      name: "Group 2",
      size: tour6GroupSize,
      entry_time: "8:45",
      child_count: 0,
      guide_id: guideMap["Tobias Schmidt"]
    },
    {
      tour_id: tourData[5].id,
      name: "Group 3",
      size: tour6TotalParticipants - (2 * tour6GroupSize),
      entry_time: "9:00",
      child_count: 0,
      guide_id: null // No guide assigned
    }
  );
  
  // Tour 7: One small group (under threshold)
  allGroups.push(
    {
      tour_id: tourData[6].id,
      name: "Group 1",
      size: 3,
      entry_time: "16:15",
      child_count: 0,
      guide_id: guideMap["Maria Garcia"]
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
