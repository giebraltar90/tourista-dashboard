
type EventCallback = (...args: any[]) => void;

interface EventSubscription {
  off: () => void;
}

class EventEmitterClass {
  private events: Record<string, EventCallback[]> = {};

  on(event: string, callback: EventCallback): EventSubscription {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    this.events[event].push(callback);
    
    return {
      off: () => {
        this.events[event] = this.events[event].filter(cb => cb !== callback);
      }
    };
  }

  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) {
      return;
    }
    
    this.events[event].forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event ${event} callback:`, error);
      }
    });
  }

  off(event: string, callback?: EventCallback): void {
    if (!callback) {
      delete this.events[event];
      return;
    }
    
    if (!this.events[event]) {
      return;
    }
    
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }
}

export const EventEmitter = new EventEmitterClass();
