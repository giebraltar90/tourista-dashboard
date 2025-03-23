
import { supabase } from "@/integrations/supabase/client";
import { TourType } from "./helpers";

/**
 * Creates test tour data in the database
 */
export const createTestTours = async (guideMap: Record<string, string>) => {
  console.log("Creating test tours with proper UUID guide references:", guideMap);
  
  // Use current year (2025) for test data
  const currentYear = 2025;
  
  // Generate dates for the tours - all in current month
  const currentDate = new Date();
  currentDate.setFullYear(currentYear);
  
  const date1 = new Date(currentDate);
  date1.setDate(currentDate.getDate() + 1);
  
  const date2 = new Date(currentDate);
  date2.setDate(currentDate.getDate() + 3);
  
  const date3 = new Date(currentDate);
  date3.setDate(currentDate.getDate() + 5);
  
  const date4 = new Date(currentDate);
  date4.setDate(currentDate.getDate() + 7);
  
  // Format dates
  const date1Formatted = date1.toISOString().split('T')[0];
  const date2Formatted = date2.toISOString().split('T')[0];
  const date3Formatted = date3.toISOString().split('T')[0];
  const date4Formatted = date4.toISOString().split('T')[0];
  
  // Get all guide IDs
  const guideIds = Object.values(guideMap);
  
  // Create tour data - each with different guides
  const tours = [
    {
      date: date1Formatted,
      location: "Versailles",
      tour_name: "Food & Palace Bike Tour",
      tour_type: "food" as TourType,
      start_time: "08:00",
      reference_code: "313911645",
      guide1_id: guideIds[0], // First guide
      guide2_id: guideIds[1], // Second guide
      num_tickets: 10,
      is_high_season: false
    },
    {
      date: date2Formatted,
      location: "Louvre",
      tour_name: "Private Louvre Tour",
      tour_type: "private" as TourType,
      start_time: "09:00",
      reference_code: "313911867",
      guide1_id: guideIds[2], // Third guide
      guide2_id: guideIds[3], // Fourth guide
      num_tickets: 12,
      is_high_season: false
    },
    {
      date: date3Formatted,
      location: "Montmartre",
      tour_name: "Montmartre Walking Tour", 
      tour_type: "default" as TourType,
      start_time: "14:00",
      reference_code: "313922567",
      guide1_id: guideIds[4], // Fifth guide
      guide2_id: guideIds[5], // Sixth guide
      guide3_id: guideIds[6], // Seventh guide
      num_tickets: 15,
      is_high_season: true
    },
    {
      date: date4Formatted,
      location: "Eiffel Tower",
      tour_name: "Eiffel Tower Tour",
      tour_type: "default" as TourType,
      start_time: "10:00",
      reference_code: "324598761",
      guide1_id: guideIds[6], // Seventh guide
      guide2_id: guideIds[7], // Eighth guide
      guide3_id: guideIds[0], // First guide again
      num_tickets: 20,
      is_high_season: true
    }
  ];
  
  // First check if tours already exist
  for (const tour of tours) {
    const { data: existingTour } = await supabase
      .from('tours')
      .select('id')
      .eq('reference_code', tour.reference_code)
      .single();
      
    if (existingTour) {
      // Update the existing tour
      await supabase
        .from('tours')
        .update({
          guide1_id: tour.guide1_id,
          guide2_id: tour.guide2_id,
          guide3_id: tour.guide3_id,
          is_high_season: tour.is_high_season,
          num_tickets: tour.num_tickets
        })
        .eq('id', existingTour.id);
    }
  }
  
  // Create new tours or get existing ones
  const { data: tourData, error: tourError } = await supabase
    .from('tours')
    .upsert(tours, { onConflict: 'reference_code' })
    .select();
    
  if (tourError) {
    console.error("Error creating tours:", tourError);
    throw tourError;
  }
  
  console.log("Created/updated test tours with proper guide references:", tourData);
  return tourData || [];
};
