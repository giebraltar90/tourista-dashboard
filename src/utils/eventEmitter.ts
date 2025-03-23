
type EventCallback = (...args: any[]) => void;

class EventEmitterClass {
  private events: Record<string, EventCallback[]> = {};

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
    this.events[event].forEach(callback => callback(...args));
    return true;
  }

  once(event: string, callback: EventCallback) {
    const onceCallback = (...args: any[]) => {
      this.off(event, onceCallback);
      callback(...args);
    };
    return this.on(event, onceCallback);
  }
}

// Create a singleton instance
export const EventEmitter = new EventEmitterClass();
