
// Base API configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || "https://api.example.com/v1"; // Fallback URL for development
export const API_KEY = process.env.REACT_APP_API_KEY || "demo-api-key"; // Fallback key for development

// API headers
export const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${API_KEY}`,
  "Accept": "application/json", // Added Accept header to prevent 406 errors
};

// Helper function to build URLs with proper error handling
export const buildApiUrl = (endpoint: string, params?: Record<string, string>) => {
  try {
    const url = new URL(`${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }
    
    return url.toString();
  } catch (error) {
    console.error(`Error building API URL for endpoint ${endpoint}:`, error);
    // Fallback to a simple string concatenation
    const queryString = params 
      ? `?${Object.entries(params)
          .filter(([_, value]) => value !== undefined && value !== null)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join('&')}`
      : '';
    return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}${queryString}`;
  }
};

// Error handling for API requests
export const handleApiError = (error: any, endpoint: string) => {
  console.error(`API Request failed for ${endpoint}:`, error);
  
  // You can add custom error handling here, e.g., showing toast notifications
  return {
    error: true,
    message: error.message || 'An unknown error occurred',
    status: error.status || 500,
  };
};
