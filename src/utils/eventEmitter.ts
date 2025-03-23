
/**
 * Simple event emitter for cross-component communication
 */
export const EventEmitter = {
  _events: {} as Record<string, Function[]>,
  
  // Register an event handler
  on(event: string, callback: Function) {
    if (!this._events[event]) {
      this._events[event] = [];
    }
    this._events[event].push(callback);
    
    // For debug purposes only
    console.log(`EVENT: Registered handler for "${event}", total handlers: ${this._events[event].length}`);
    
    return () => this.off(event, callback); // Return unsubscribe function
  },
  
  // Remove an event handler
  off(event: string, callback: Function) {
    if (this._events[event]) {
      this._events[event] = this._events[event].filter(cb => cb !== callback);
      
      // For debug purposes only
      console.log(`EVENT: Removed handler for "${event}", remaining handlers: ${this._events[event].length}`);
    }
  },
  
  // Trigger an event
  emit(event: string, data?: any) {
    if (this._events[event]) {
      console.log(`EVENT: Emitting "${event}" with data:`, data);
      this._events[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event handler for "${event}":`, error);
        }
      });
    } else {
      console.log(`EVENT: No handlers for "${event}"`);
    }
  }
};
