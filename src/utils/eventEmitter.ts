
// Simple event emitter for application-wide events
class AppEventEmitter {
  private events: Record<string, Function[]> = {};

  /**
   * Subscribe to an event
   */
  on(event: string, callback: Function): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, callback: Function): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  /**
   * Emit an event with data
   */
  emit(event: string, data?: any): void {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events = {};
  }
}

// Export a singleton instance
export const EventEmitter = new AppEventEmitter();
