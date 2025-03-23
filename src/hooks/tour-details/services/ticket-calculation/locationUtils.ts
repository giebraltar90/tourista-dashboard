
import { logger } from "@/utils/logger";

/**
 * Check if a location requires guide tickets
 */
export const locationRequiresGuideTickets = (location: string = ""): boolean => {
  // Normalize location name by trimming and converting to lowercase
  const normalizedLocation = location.trim().toLowerCase();
  
  // Debug logging for location check
  logger.debug(`🎟️ [locationRequiresGuideTickets] Checking location "${location}"`);
  
  // Locations that require guide tickets
  const requiresTicketLocations = [
    "louvre",
    "louvre museum",
    "versailles",
    "palace of versailles",
    "notre dame",
    "notre dame cathedral",
    "eiffel tower",
    "musée d'orsay",
    "orsay museum",
    "sacré-cœur",
    "sacre-coeur",
    "centre pompidou",
    "pompidou center",
    "sainte chapelle"
  ];
  
  // Locations that don't require guide tickets
  const noTicketLocations = [
    "montmartre",
    "latin quarter", 
    "le marais",
    "street art tour",
    "food tour"
  ];
  
  // Check if location is in the requires-ticket list
  const requiresTicket = requiresTicketLocations.some(loc => 
    normalizedLocation.includes(loc)
  );
  
  // Check if location is in the no-ticket list
  const explicitlyNoTicket = noTicketLocations.some(loc => 
    normalizedLocation.includes(loc)
  );
  
  // If location is explicitly no-ticket, that takes precedence
  const finalResult = explicitlyNoTicket ? false : requiresTicket;
  
  // Detailed log with full consideration
  logger.debug(`🎟️ [locationRequiresGuideTickets] Location "${location}" check result:`, {
    normalizedLocation,
    inRequiresTicketList: requiresTicket,
    inNoTicketList: explicitlyNoTicket,
    finalResult
  });
  
  return finalResult;
};
