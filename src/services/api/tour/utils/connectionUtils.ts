
import { supabase } from "@/integrations/supabase/client";
import { API_ANON_KEY, API_BASE_URL } from "@/integrations/supabase/constants";

/**
 * Check Supabase connection before attempting data fetching
 */
export const testConnection = async (): Promise<{
  success: boolean;
  data?: any;
  error?: any;
}> => {
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

/**
 * Check authentication status with improved error handling
 */
export const checkAuthentication = async (): Promise<{
  success: boolean;
  status?: number;
  statusText?: string;
  error?: string;
}> => {
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
