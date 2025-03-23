
import { supabase } from "@/integrations/supabase/client";
import { TourType } from "./helpers";

/**
 * Creates test tour data in the database
 */
export const createTestTours = async (guideMap: Record<string, string>) => {
  console.log("Creating test tours with proper UUID guide references:", guideMap);
  
  // Use current year (2025) for test data
  const currentYear = 2025;
  
  // Generate dates for the tours
  const today = new Date();
  today.setFullYear(currentYear);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(today.getDate() + 2);
  
  const threeDaysLater = new Date(today);
  threeDaysLater.setDate(today.getDate() + 3);
  
  const fourDaysLater = new Date(today);
  fourDaysLater.setDate(today.getDate() + 4);
  
  // Format today's date
  const todayFormatted = today.toISOString().split('T')[0];
  
  // Create tour data - using proper UUID references for guides
  const tours = [
    {
      date: todayFormatted,
      location: "Versailles",
      tour_name: "Food & Palace Bike Tour",
      tour_type: "food" as "food" | "private" | "default", // Explicitly cast to allowed types
      start_time: "08:00",
      reference_code: "313911645",
      guide1_id: guideMap["Noéma Weber"], // GA Free guide
      guide2_id: null,
      num_tickets: 10,
      is_high_season: false
    },
    {
      date: todayFormatted,
      location: "Versailles",
      tour_name: "Private Versailles Tour",
      tour_type: "private" as "food" | "private" | "default",
      start_time: "09:00",
      reference_code: "313911867",
      guide1_id: guideMap["Carlos Martinez"], // GA Ticket guide
      guide2_id: null,
      num_tickets: 4,
      is_high_season: false
    },
    {
      date: todayFormatted,
      location: "Montmartre",
      tour_name: "Montmartre Walking Tour", 
      tour_type: "default" as "food" | "private" | "default",
      start_time: "14:00",
      reference_code: "313922567",
      guide1_id: guideMap["Sophie Miller"], // GC guide (no ticket)
      guide2_id: guideMap["Maria Garcia"], // GA Free guide (child ticket)
      num_tickets: 15,
      is_high_season: false
    },
    {
      date: tomorrow.toISOString().split('T')[0],
      location: "Louvre Museum",
      tour_name: "Private Louvre Tour",
      tour_type: "private" as "food" | "private" | "default",
      start_time: "10:00",
      reference_code: "324598761",
      guide1_id: guideMap["Sophie Miller"],
      guide2_id: null,
      num_tickets: 4,
      is_high_season: false
    },
    {
      date: dayAfterTomorrow.toISOString().split('T')[0],
      location: "Montmartre",
      tour_name: "Montmartre Walking Tour",
      tour_type: "default" as "food" | "private" | "default",
      start_time: "14:00",
      reference_code: "324598799",
      guide1_id: guideMap["Jean Dupont"],
      guide2_id: null,
      num_tickets: 22,
      is_high_season: false
    },
    {
      date: threeDaysLater.toISOString().split('T')[0],
      location: "Versailles",
      tour_name: "Food & Palace Bike Tour",
      tour_type: "food" as "food" | "private" | "default",
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
      tour_type: "default" as "food" | "private" | "default",
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
  
  console.log("Created test tours with proper UUID references:", tourData);
  return tourData || [];
};
