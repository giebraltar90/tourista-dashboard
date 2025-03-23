
import { logger } from "@/utils/logger";

/**
 * Check if a location requires guide tickets
 */
export const locationRequiresGuideTickets = (location: string = ""): boolean => {
  // Handle undefined or null location
  if (!location) {
    logger.debug(`🎟️ [locationRequiresGuideTickets] No location provided, defaulting to no tickets required`);
    return false;
  }
  
  // Normalize location name by trimming and converting to lowercase
  const normalizedLocation = location.trim().toLowerCase();
  
  // Debug logging for location check
  logger.debug(`🎟️ [locationRequiresGuideTickets] Checking location "${location}"`);
  
  // Locations that require guide tickets
  const requiresTicketLocations = [
    "louvre",
    "versailles",
    "palace of versailles",
    "chateau de versailles",
    "notre dame",
    "notre-dame",
    "eiffel tower",
    "tour eiffel",
    "musée d'orsay",
    "orsay",
    "d'orsay",
    "sacré-cœur",
    "sacre-coeur",
    "sacre coeur",
    "centre pompidou",
    "pompidou",
    "sainte chapelle",
    "sainte-chapelle",
    "catacombs",
    "les catacombes",
    "opera garnier"
  ];
  
  // Locations that don't require guide tickets
  const noTicketLocations = [
    "montmartre",
    "latin quarter", 
    "le marais",
    "street art",
    "food tour",
    "saint germain",
    "st germain",
    "saint-germain",
    "city tour",
    "walking tour"
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
  
  logger.debug(`🎟️ [locationRequiresGuideTickets] Location "${location}" result:`, {
    normalizedLocation,
    inRequiresTicketList: requiresTicket,
    inNoTicketList: explicitlyNoTicket,
    finalResult
  });
  
  return finalResult;
};
