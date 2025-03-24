
type EventHandler = (...args: any[]) => void;

class EventEmitterClass {
  private events: Record<string, EventHandler[]> = {};

  // Add an event listener
  on(event: string, handler: EventHandler): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(handler);
  }

  // Remove an event listener
  off(event: string, handler?: EventHandler): void {
    if (!this.events[event]) return;

    if (!handler) {
      // Remove all handlers for this event
      delete this.events[event];
    } else {
      // Remove specific handler
      this.events[event] = this.events[event].filter(h => h !== handler);
    }
  }

  // Emit an event
  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;

    // Call each handler with the provided arguments
    this.events[event].forEach(handler => {
      try {
        handler(...args);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  // Get all registered events
  getEvents(): string[] {
    return Object.keys(this.events);
  }
}

// Create a singleton instance
export const EventEmitter = new EventEmitterClass();
