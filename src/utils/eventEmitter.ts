import { EventEmitter as Emitter } from 'eventemitter3';

// Event emitter singleton for application-wide events
export const EventEmitter = new Emitter();

// Define event types with strong typing
export const EVENTS = {
  // Tour data events
  TOUR_UPDATED: (tourId: string) => `tour-updated:${tourId}`,
  TOUR_DATA_LOADED: (tourId: string) => `tour-data-loaded:${tourId}`,
  
  // Guide assignment events
  GUIDE_CHANGED: (tourId: string) => `guide-change:${tourId}`,
  GUIDE_ASSIGNMENT_UPDATED: (tourId: string) => `guide-assignment-updated:${tourId}`,
  
  // Participant events
  PARTICIPANT_MOVED: (tourId: string) => `participant-moved:${tourId}`,
  PARTICIPANT_ADDED: (tourId: string) => `participant-added:${tourId}`,
  PARTICIPANT_REMOVED: (tourId: string) => `participant-removed:${tourId}`,
  PARTICIPANTS_LOADED: (tourId: string) => `participants-loaded:${tourId}`,
  PARTICIPANTS_REFRESHED: (tourId: string) => `participants-refreshed:${tourId}`,
  PARTICIPANT_CHANGED: (tourId: string) => `participant-changed:${tourId}`,
  
  // Ticket events
  RECALCULATE_TICKETS: (tourId: string) => `recalculate-tickets:${tourId}`,
  TICKETS_UPDATED: (tourId: string) => `tickets-updated:${tourId}`,
  
  // Other events
  REFETCH_REQUIRED: 'refetch-required',
  REFRESH_PARTICIPANTS: 'refresh-participants',
  AUTH_ERROR: 'auth-error'
};

// Attach a listener for a tour event
export const listenToTourEvent = (eventName: string, tourId: string, callback: (data?: any) => void) => {
  const fullEventName = `${eventName}:${tourId}`;
  EventEmitter.on(fullEventName, callback);
  return () => EventEmitter.off(fullEventName, callback);
};
