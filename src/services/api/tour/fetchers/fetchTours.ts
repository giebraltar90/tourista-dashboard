
import { TourCardProps } from "@/components/tours/tour-card/types";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { mockTours } from "@/data/mockData";
import { toast } from "sonner";
import { transformSupabaseToursData } from "../transformers/tourTransformer";
import { fetchGuideData } from "./fetchGuideData";
import { testConnection, checkAuthentication } from "../utils/connectionUtils";

/**
 * Fetch tours from Supabase with improved error handling
 */
export const fetchToursFromSupabase = async (params?: {
  startDate?: string;
  endDate?: string;
  location?: string;
}): Promise<TourCardProps[]> => {
  try {
    logger.debug("🔍 Fetching tours from Supabase", params);
    
    // Check for network connectivity first
    if (!navigator.onLine) {
      logger.warn("⚠️ Browser is offline, returning mock data");
      return mockTours;
    }
    
    // Test connection first with improved error handling
    try {
      const connectionTest = await testConnection();
      if (!connectionTest.success) {
        logger.error("❌ Supabase connection failed before fetching tours:", connectionTest.error);
        return mockTours;
      }
    } catch (connErr) {
      logger.error("❌ Exception during connection test:", connErr);
      return mockTours;
    }
    
    // Build query
    let query = supabase
      .from('tours')
      .select(`
        id, date, location, tour_name, tour_type, start_time, 
        reference_code, guide1_id, guide2_id, guide3_id, 
        num_tickets, is_high_season,
        tour_groups (id, name, size, entry_time, guide_id, child_count)
      `)
      .order('date', { ascending: true });

    // Add filters if provided
    if (params?.location) {
      query = query.eq('location', params.location);
    }
    
    if (params?.startDate) {
      query = query.gte('date', params.startDate);
    }
    
    if (params?.endDate) {
      query = query.lte('date', params.endDate);
    }
      
    const { data: supabaseTours, error } = await query;
      
    if (error) {
      // Log detailed error information
      logger.error("❌ Error fetching tours from Supabase:", { 
        error,
        statusCode: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      // Fall back to mock data after logging the error
      logger.warn("⚠️ Falling back to mock data due to Supabase error");
      return mockTours;
    }
    
    if (!supabaseTours || supabaseTours.length === 0) {
      logger.debug("⚠️ No tours found in Supabase");
      
      // Return mock data as fallback
      logger.warn("⚠️ Returning mock data since no tours were found");
      return mockTours;
    }
    
    logger.debug("✅ Successfully fetched tours from Supabase", { 
      count: supabaseTours.length,
    });
    
    // Collect guide IDs and fetch guide data
    const guideIds = new Set<string>();
    supabaseTours.forEach(tour => {
      if (tour.guide1_id) guideIds.add(tour.guide1_id);
      if (tour.guide2_id) guideIds.add(tour.guide2_id);
      if (tour.guide3_id) guideIds.add(tour.guide3_id);
      
      // Also collect guide IDs from tour groups
      if (tour.tour_groups && Array.isArray(tour.tour_groups)) {
        tour.tour_groups.forEach(group => {
          if (group.guide_id) {
            guideIds.add(group.guide_id);
          }
        });
      }
    });
    
    // Fetch guide data and create guide mapping
    const guideMap = await fetchGuideData(guideIds);
    
    // Transform data and return
    const transformedTours = transformSupabaseToursData(supabaseTours, guideMap);
    
    logger.debug("✅ Successfully transformed tours data", { count: transformedTours.length });
    return transformedTours;
  } catch (error) {
    logger.error("❌ Exception in fetchToursFromSupabase:", error);
    // Return mock data as fallback to prevent UI crashes
    logger.warn("⚠️ Falling back to mock data after exception");
    return mockTours;
  }
};
