
type EventCallback = (data: any) => void;

/**
 * Simple event emitter for cross-component communication
 */
class EventEmitterClass {
  private events: Record<string, EventCallback[]> = {};
  private debugEnabled: boolean = true;

  constructor() {
    // Check if we're in development mode
    this.debugEnabled = import.meta.env.DEV === true;
    
    if (this.debugEnabled) {
      console.log('[EventEmitter] Initialized in debug mode');
    }
  }

  // Enable or disable debug logging
  setDebug(enabled: boolean): void {
    this.debugEnabled = enabled;
  }

  // Log messages if debug is enabled
  private log(message: string, ...args: any[]): void {
    if (this.debugEnabled) {
      console.log(`[EventEmitter] ${message}`, ...args);
    }
  }

  // Register an event listener
  on(event: string, callback: EventCallback): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    
    this.log(`Registered event handler for: ${event}`);
  }

  // Remove an event listener
  off(event: string, callback?: EventCallback): void {
    if (!event) {
      this.log('Warning: Attempted to remove listener for undefined event');
      return;
    }
    
    if (!callback) {
      delete this.events[event];
      this.log(`Removed all handlers for: ${event}`);
      return;
    }
    
    const callbacks = this.events[event];
    if (!callbacks) return;
    
    this.events[event] = callbacks.filter(cb => cb !== callback);
    this.log(`Removed specific handler for: ${event}`);
    
    // Clean up empty arrays
    if (this.events[event].length === 0) {
      delete this.events[event];
    }
  }

  // Emit an event with data
  emit(event: string, data?: any): void {
    try {
      const callbacks = this.events[event];
      
      if (!callbacks || callbacks.length === 0) {
        this.log(`Event emitted with no listeners: ${event}`);
        
        // Check for wildcard listeners (event patterns with *)
        const wildcardEvents = Object.keys(this.events).filter(e => 
          e.includes('*') && new RegExp('^' + e.replace('*', '.*') + '$').test(event)
        );
        
        wildcardEvents.forEach(wildcardEvent => {
          this.events[wildcardEvent].forEach(callback => {
            try {
              callback({
                ...data,
                originalEvent: event,
                wildcardEvent
              });
            } catch (error) {
              console.error(`[EventEmitter] Error in wildcard listener for ${event} (${wildcardEvent}):`, error);
            }
          });
        });
        
        return;
      }

      this.log(`Emitting event: ${event} with ${callbacks.length} listeners`, 
        data ? { dataPreview: typeof data === 'object' ? Object.keys(data) : typeof data } : 'no data'
      );
      
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[EventEmitter] Error in listener for ${event}:`, error);
        }
      });
    } catch (error) {
      console.error(`[EventEmitter] Error emitting event ${event}:`, error);
    }
  }
  
  // Return all registered event types
  listEvents(): string[] {
    return Object.keys(this.events);
  }
  
  // Check if an event has listeners
  hasListeners(event: string): boolean {
    return !!this.events[event] && this.events[event].length > 0;
  }
  
  // Get the number of listeners for an event
  getListenerCount(event: string): number {
    return this.events[event]?.length || 0;
  }
  
  // Clear all events
  clearAll(): void {
    this.events = {};
    this.log('Cleared all event listeners');
  }
}

// Create a singleton instance
export const EventEmitter = new EventEmitterClass();

// Event name constants for better code organization
export const EVENTS = {
  GUIDE_CHANGED: (tourId: string) => `guide-change:${tourId}`,
  GUIDE_ASSIGNMENT_UPDATED: (tourId: string) => `guide-assignment-updated:${tourId}`,
  PARTICIPANT_CHANGED: (tourId: string) => `participant-change:${tourId}`,
  TOUR_DATA_LOADED: (tourId: string) => `tour-data-loaded:${tourId}`,
  REFRESH_PARTICIPANTS: 'refresh-participants',
  RECALCULATE_TICKETS: (tourId: string) => `recalculate-tickets:${tourId}`,
};
