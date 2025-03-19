
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Database } from "@/integrations/supabase/types";

// Define the guide type from the database schema
type GuideType = Database["public"]["Enums"]["guide_type"];
type TourType = Database["public"]["Enums"]["tour_type"];
type ModificationStatus = Database["public"]["Enums"]["modification_status"];

export const useTestData = () => {
  const queryClient = useQueryClient();

  // Function to create test tours
  const createTestTours = async () => {
    try {
      console.log("Creating test tour data...");
      
      // First, clear any existing test data
      await clearTestData();
      
      // Create test guides
      const guides = [
        { name: "Noéma Weber", guide_type: "GA Free" as GuideType, birthday: "1998-12-03" },
        { name: "Jean Dupont", guide_type: "GA Ticket" as GuideType, birthday: "1985-03-22" },
        { name: "Sophie Miller", guide_type: "GC" as GuideType, birthday: "1990-10-05" },
        { name: "Carlos Martinez", guide_type: "GA Ticket" as GuideType, birthday: "1988-05-18" },
        { name: "Maria Garcia", guide_type: "GA Free" as GuideType, birthday: "1995-07-15" },
        { name: "Tobias Schmidt", guide_type: "GC" as GuideType, birthday: "1982-08-27" }
      ];
      
      const { data: guideData, error: guideError } = await supabase
        .from('guides')
        .insert(guides)
        .select();
        
      if (guideError) {
        console.error("Error creating guides:", guideError);
        throw guideError;
      }
      
      console.log("Created test guides:", guideData);
      
      // Map guide names to their IDs
      const guideMap = Object.fromEntries(
        guideData?.map(guide => [guide.name, guide.id]) || []
      );
      
      // Create test tours
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      const dayAfterTomorrow = new Date(today);
      dayAfterTomorrow.setDate(today.getDate() + 2);
      
      const threeDaysLater = new Date(today);
      threeDaysLater.setDate(today.getDate() + 3);
      
      const fourDaysLater = new Date(today);
      fourDaysLater.setDate(today.getDate() + 4);
      
      const tours = [
        {
          date: "2023-05-07",
          location: "Versailles",
          tour_name: "Food & Palace Bike Tour",
          tour_type: "food" as TourType,
          start_time: "08:00",
          reference_code: "313911645",
          guide1_id: guideMap["Noéma Weber"],
          guide2_id: guideMap["Jean Dupont"],
          num_tickets: 10,
          is_high_season: false
        },
        {
          date: "2023-05-07",
          location: "Versailles",
          tour_name: "Private Versailles Tour",
          tour_type: "private" as TourType,
          start_time: "09:00",
          reference_code: "313911867",
          guide1_id: guideMap["Carlos Martinez"],
          guide2_id: guideMap["Jean Dupont"],
          num_tickets: 4,
          is_high_season: false
        },
        {
          date: "2023-05-07",
          location: "Versailles",
          tour_name: "Food & Palace Bike Tour",
          tour_type: "food" as TourType,
          start_time: "09:00",
          reference_code: "313911867",
          guide1_id: guideMap["Sophie Miller"],
          guide2_id: guideMap["Maria Garcia"],
          num_tickets: 9,
          is_high_season: false
        },
        {
          date: tomorrow.toISOString().split('T')[0],
          location: "Louvre Museum",
          tour_name: "Private Louvre Tour",
          tour_type: "private" as TourType,
          start_time: "10:00",
          reference_code: "324598761",
          guide1_id: guideMap["Sophie Miller"],
          guide2_id: guideMap["Carlos Martinez"],
          num_tickets: 4,
          is_high_season: false
        },
        {
          date: dayAfterTomorrow.toISOString().split('T')[0],
          location: "Montmartre",
          tour_name: "Montmartre Walking Tour",
          tour_type: "default" as TourType,
          start_time: "14:00",
          reference_code: "324598799",
          guide1_id: guideMap["Jean Dupont"],
          num_tickets: 22,
          is_high_season: false
        },
        {
          date: threeDaysLater.toISOString().split('T')[0],
          location: "Versailles",
          tour_name: "Food & Palace Bike Tour",
          tour_type: "food" as TourType,
          start_time: "08:00",
          reference_code: "324598820",
          guide1_id: guideMap["Maria Garcia"],
          guide2_id: guideMap["Tobias Schmidt"],
          num_tickets: 24,
          is_high_season: true
        },
        {
          date: fourDaysLater.toISOString().split('T')[0],
          location: "Eiffel Tower",
          tour_name: "Eiffel Tower & Seine River Cruise",
          tour_type: "default" as TourType,
          start_time: "16:00",
          reference_code: "324598850",
          guide1_id: guideMap["Maria Garcia"],
          guide2_id: guideMap["Sophie Miller"],
          num_tickets: 3,
          is_high_season: false
        }
      ];
      
      const { data: tourData, error: tourError } = await supabase
        .from('tours')
        .insert(tours)
        .select();
        
      if (tourError) {
        console.error("Error creating tours:", tourError);
        throw tourError;
      }
      
      console.log("Created test tours:", tourData);
      
      // Create tour groups for each tour
      let allGroups = [];
      
      // Tour 1: Two groups
      allGroups.push(
        {
          tour_id: tourData[0].id,
          name: "Noéma's Group",
          size: 6,
          entry_time: "9:10",
          child_count: 2,
          guide_id: guideMap["Noéma Weber"]
        },
        {
          tour_id: tourData[0].id,
          name: "Jean's Group",
          size: 4,
          entry_time: "9:10",
          child_count: 1,
          guide_id: guideMap["Jean Dupont"]
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
          guide_id: guideMap["Carlos Martinez"]
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
          guide_id: guideMap["Sophie Miller"]
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
          guide_id: guideMap["Sophie Miller"]
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
          guide_id: guideMap["Jean Dupont"]
        },
        {
          tour_id: tourData[4].id,
          name: "Group B",
          size: 10,
          entry_time: "14:15",
          child_count: 0
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
          guide_id: guideMap["Maria Garcia"]
        },
        {
          tour_id: tourData[5].id,
          name: "Tobias's Group",
          size: 8,
          entry_time: "8:45",
          child_count: 0,
          guide_id: guideMap["Tobias Schmidt"]
        },
        {
          tour_id: tourData[5].id,
          name: "Third Group",
          size: 8,
          entry_time: "9:00",
          child_count: 0
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
      
      console.log("Created test tour groups:", groupData);
      
      // Create participants for some groups
      const participants = [
        // Participants for first tour, first group
        {
          group_id: groupData[0].id,
          name: "Smith Family",
          count: 2,
          booking_ref: "BK001",
          child_count: 1
        },
        {
          group_id: groupData[0].id,
          name: "John Davis",
          count: 1,
          booking_ref: "BK002",
          child_count: 0
        },
        {
          group_id: groupData[0].id,
          name: "Rodriguez Family",
          count: 3,
          booking_ref: "BK003",
          child_count: 1
        },
        
        // Participants for first tour, second group
        {
          group_id: groupData[1].id,
          name: "Wilson Couple",
          count: 2,
          booking_ref: "BK004",
          child_count: 0
        },
        {
          group_id: groupData[1].id,
          name: "Laura Chen",
          count: 1,
          booking_ref: "BK005",
          child_count: 0
        },
        {
          group_id: groupData[1].id,
          name: "Michael Brown",
          count: 1,
          booking_ref: "BK006",
          child_count: 1
        },
        
        // Participants for second tour
        {
          group_id: groupData[2].id,
          name: "Johnson Family",
          count: 4,
          booking_ref: "BK007",
          child_count: 0
        }
      ];
      
      const { data: participantData, error: participantError } = await supabase
        .from('participants')
        .insert(participants)
        .select();
        
      if (participantError) {
        console.error("Error creating participants:", participantError);
        throw participantError;
      }
      
      console.log("Created test participants:", participantData);
      
      // Add some modifications
      const modifications = [
        {
          tour_id: tourData[0].id,
          description: "Group sizes adjusted",
          details: { type: "group_size", before: 5, after: 6 },
          status: "complete" as ModificationStatus
        },
        {
          tour_id: tourData[0].id,
          description: "Guide Noéma assigned to Group 1",
          details: { type: "guide_assignment", groupName: "Group 1", guideName: "Noéma Weber" },
          status: "complete" as ModificationStatus
        },
        {
          tour_id: tourData[2].id,
          description: "Changed entry time from 15:30 to 16:00",
          details: { type: "entry_time", before: "15:30", after: "16:00" },
          status: "complete" as ModificationStatus
        }
      ];
      
      const { data: modificationData, error: modificationError } = await supabase
        .from('modifications')
        .insert(modifications)
        .select();
        
      if (modificationError) {
        console.error("Error creating modifications:", modificationError);
        throw modificationError;
      }
      
      console.log("Created test modifications:", modificationData);
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      
      toast.success("Test data created successfully");
      return true;
    } catch (error) {
      console.error("Error creating test data:", error);
      toast.error("Failed to create test data");
      return false;
    }
  };
  
  // Function to clear all test data
  const clearTestData = async () => {
    try {
      console.log("Clearing all test data...");
      
      // Delete in reverse order of dependencies
      const tables = ['participants', 'modifications', 'tour_groups', 'tours', 'guides'];
      
      for (const table of tables) {
        const { error } = await supabase
          .from(table as any)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
          
        if (error) {
          console.error(`Error clearing ${table}:`, error);
          throw error;
        }
      }
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      
      toast.success("Test data cleared successfully");
      return true;
    } catch (error) {
      console.error("Error clearing test data:", error);
      toast.error("Failed to clear test data");
      return false;
    }
  };
  
  return {
    createTestTours,
    clearTestData
  };
};
