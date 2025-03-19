
import { supabase } from "@/integrations/supabase/client";
import { TourType } from "./helpers";

/**
 * Creates test tour data in the database
 */
export const createTestTours = async (guideMap: Record<string, string>) => {
  console.log("Creating test tours...");
  
  // Generate dates for the tours
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(today.getDate() + 2);
  
  const threeDaysLater = new Date(today);
  threeDaysLater.setDate(today.getDate() + 3);
  
  const fourDaysLater = new Date(today);
  fourDaysLater.setDate(today.getDate() + 4);
  
  // Create tour data
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
  return tourData || [];
};
