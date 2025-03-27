
import { TourCardProps } from "@/components/tours/tour-card/types";
import { supabase } from "@/integrations/supabase/client";
import { isValidUuid } from "@/services/api/utils/guidesUtils";
import { logger } from "@/utils/logger";
import { mockTours } from "@/data/mockData";
import { toast } from "sonner";
import { API_ANON_KEY, API_BASE_URL } from "@/integrations/supabase/constants";

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
      const connectionTest = await testSupabaseConnection();
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
    
    // Collect all guide IDs to fetch them in a single request
    const guideIds = new Set<string>();
    supabaseTours.forEach(tour => {
      if (tour.guide1_id && isValidUuid(tour.guide1_id)) guideIds.add(tour.guide1_id);
      if (tour.guide2_id && isValidUuid(tour.guide2_id)) guideIds.add(tour.guide2_id);
      if (tour.guide3_id && isValidUuid(tour.guide3_id)) guideIds.add(tour.guide3_id);
      
      // Also collect guide IDs from tour groups
      if (tour.tour_groups && Array.isArray(tour.tour_groups)) {
        tour.tour_groups.forEach(group => {
          if (group.guide_id && isValidUuid(group.guide_id)) {
            guideIds.add(group.guide_id);
          }
        });
      }
    });
    
    // Create a mapping of guide IDs to guide names
    let guideMap: Record<string, string> = {};
    
    if (guideIds.size > 0) {
      try {
        const guideIdsArray = Array.from(guideIds);
        logger.debug("🔍 Fetching guide data for IDs:", guideIdsArray);
        
        const { data: guides, error: guidesError } = await supabase
          .from('guides')
          .select('id, name')
          .in('id', guideIdsArray);
          
        if (guidesError) {
          logger.error("❌ Error fetching guides:", guidesError);
        } else if (guides && guides.length > 0) {
          guideMap = guides.reduce((map, guide) => {
            map[guide.id] = guide.name;
            return map;
          }, {} as Record<string, string>);
          
          logger.debug("✅ Successfully built guide map", { 
            requestedCount: guideIds.size, 
            retrievedCount: guides.length 
          });
        }
      } catch (guideErr) {
        logger.error("❌ Exception while fetching guides:", guideErr);
      }
    }
    
    // Transform the Supabase data to match our TourCardProps structure
    const transformedTours = supabaseTours.map(tour => {
      // Use guideMap to resolve guide names from IDs
      const guide1 = tour.guide1_id && guideMap[tour.guide1_id] ? guideMap[tour.guide1_id] : tour.guide1_id || "";
      const guide2 = tour.guide2_id && guideMap[tour.guide2_id] ? guideMap[tour.guide2_id] : tour.guide2_id || "";
      const guide3 = tour.guide3_id && guideMap[tour.guide3_id] ? guideMap[tour.guide3_id] : tour.guide3_id || "";
      
      // Transform tour groups
      const tourGroups = Array.isArray(tour.tour_groups) ? tour.tour_groups.map(group => {
        const guideName = group.guide_id && guideMap[group.guide_id] ? guideMap[group.guide_id] : undefined;
        
        return {
          id: group.id,
          name: group.name || "",
          size: group.size || 0,
          entryTime: group.entry_time || "",
          childCount: group.child_count || 0,
          guideId: group.guide_id || undefined,
          guideName,
          participants: []  // Initialize with empty array; participants are fetched separately
        };
      }) : [];
      
      const transformedTour = {
        id: tour.id,
        date: new Date(tour.date),
        location: tour.location,
        tourName: tour.tour_name,
        tourType: tour.tour_type,
        startTime: tour.start_time,
        referenceCode: tour.reference_code,
        guide1,
        guide2,
        guide3,
        guide1Id: tour.guide1_id || "",
        guide2Id: tour.guide2_id || "",
        guide3Id: tour.guide3_id || "",
        tourGroups,
        numTickets: tour.num_tickets || 0,
        isHighSeason: tour.is_high_season === true
      };
      
      return transformedTour;
    });
    
    logger.debug("✅ Successfully transformed tours data", { count: transformedTours.length });
    return transformedTours;
  } catch (error) {
    logger.error("❌ Exception in fetchToursFromSupabase:", error);
    // Return mock data as fallback to prevent UI crashes
    logger.warn("⚠️ Falling back to mock data after exception");
    return mockTours;
  }
};

// Helper function to check connection before fetching with better error handling
const testSupabaseConnection = async () => {
  try {
    // Simple health check that doesn't depend on auth
    const response = await fetch(`${API_BASE_URL}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': API_ANON_KEY,
        'Content-Type': 'application/json'
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000)
    }).catch(err => {
      throw new Error(`Network error accessing Supabase: ${err.message}`);
    });
    
    if (!response.ok) {
      return { 
        success: false, 
        error: `Supabase API returned status: ${response.status} ${response.statusText}` 
      };
    }
    
    // If health check passes, try an actual query
    const { data, error } = await supabase
      .from('tours')
      .select('id')
      .limit(1);
      
    if (error) {
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err : new Error('Unknown error during connection test')
    };
  }
};

// Check authentication status with improved error handling
const checkAuthStatus = async () => {
  try {
    const headers = {
      'apikey': API_ANON_KEY,
      'Authorization': `Bearer ${API_ANON_KEY}`,
      'Content-Type': 'application/json'
    };
    
    // Basic connectivity test with timeout
    const response = await fetch(`${API_BASE_URL}/rest/v1/tours?select=id&limit=1`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(5000)
    }).catch(err => {
      throw new Error(`Network error during auth check: ${err.message}`);
    });
    
    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};
