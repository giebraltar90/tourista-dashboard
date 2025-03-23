
import { logger } from "@/utils/logger";

/**
 * Check if a location requires guide tickets
 */
export const locationRequiresGuideTickets = (location: string = ""): boolean => {
  // Normalize location to lowercase for case-insensitive comparison
  const locationLower = (location || '').toLowerCase().trim();
  
  return locationLower.includes('versailles') || 
         locationLower.includes('versaille') || // Common misspelling
         locationLower.includes('montmartre');
};
