
type EventCallback = (...args: any[]) => void;

class EventEmitterClass {
  private events: Record<string, EventCallback[]> = {};
  private lastErrors: Record<string, Error | null> = {};

  on(event: string, callback: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    return this;
  }

  off(event: string, callback: EventCallback) {
    if (!this.events[event]) return this;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
    return this;
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return false;
    
    // Log event emission for debugging
    console.log(`EventEmitter: Emitting "${event}" with ${this.events[event].length} listeners`);
    
    // Execute each callback in a try/catch to prevent one bad callback from blocking others
    this.events[event].forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in "${event}" event listener:`, error);
        this.lastErrors[event] = error instanceof Error ? error : new Error(String(error));
      }
    });
    
    return true;
  }

  once(event: string, callback: EventCallback) {
    const onceCallback = (...args: any[]) => {
      this.off(event, onceCallback);
      callback(...args);
    };
    return this.on(event, onceCallback);
  }

  // Helper to clear all listeners for testing/cleanup
  clear(event?: string) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
    return this;
  }

  // Get number of listeners for a given event
  listenerCount(event: string): number {
    return this.events[event]?.length || 0;
  }
}

// Create a singleton instance
export const EventEmitter = new EventEmitterClass();
