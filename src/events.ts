/**
 * Event system for error lifecycle
 *
 * This module provides an event emitter for tracking error creation,
 * transformation, and other lifecycle events.
 */

import { TryError } from "./types";

/**
 * Error lifecycle events
 */
export type ErrorEvent =
  | { type: "error:created"; error: TryError; timestamp: number }
  | {
      type: "error:transformed";
      original: TryError;
      transformed: TryError;
      timestamp: number;
    }
  | { type: "error:pooled"; error: TryError; timestamp: number }
  | { type: "error:released"; error: TryError; timestamp: number }
  | {
      type: "error:serialized";
      error: TryError;
      serialized: any;
      timestamp: number;
    }
  | {
      type: "error:wrapped";
      cause: unknown;
      error: TryError;
      timestamp: number;
    }
  | { type: "error:retry"; error: TryError; attempt: number; timestamp: number }
  | {
      type: "error:recovered";
      error: TryError;
      recovery: any;
      timestamp: number;
    };

/**
 * Event listener function
 */
export type ErrorEventListener = (event: ErrorEvent) => void;

/**
 * Event emitter for error lifecycle
 */
export class ErrorEventEmitter {
  private listeners = new Map<string, Set<ErrorEventListener>>();
  private allListeners = new Set<ErrorEventListener>();
  private eventQueue: ErrorEvent[] = [];
  private isProcessing = false;
  private maxQueueSize = 1000;

  /**
   * Subscribe to a specific event type
   */
  on(eventType: ErrorEvent["type"], listener: ErrorEventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(listener);
    };
  }

  /**
   * Subscribe to all events
   */
  onAll(listener: ErrorEventListener): () => void {
    this.allListeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.allListeners.delete(listener);
    };
  }

  /**
   * Subscribe to an event once
   */
  once(
    eventType: ErrorEvent["type"],
    listener: ErrorEventListener
  ): () => void {
    const wrappedListener: ErrorEventListener = (event) => {
      if (event.type === eventType) {
        listener(event);
        this.off(eventType, wrappedListener);
      }
    };
    return this.on(eventType, wrappedListener);
  }

  /**
   * Unsubscribe from a specific event type
   */
  off(eventType: ErrorEvent["type"], listener: ErrorEventListener): void {
    this.listeners.get(eventType)?.delete(listener);
  }

  /**
   * Unsubscribe from all events
   */
  offAll(listener: ErrorEventListener): void {
    this.allListeners.delete(listener);
  }

  /**
   * Emit an event
   */
  emit(event: ErrorEvent): void {
    // Add to queue
    this.eventQueue.push(event);

    // Prevent queue overflow
    if (this.eventQueue.length > this.maxQueueSize) {
      this.eventQueue.shift(); // Remove oldest event
    }

    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Process event queue
   */
  private processQueue(): void {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    // Process events in microtask to avoid blocking
    queueMicrotask(() => {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift()!;

        // Notify specific listeners
        const specificListeners = this.listeners.get(event.type);
        if (specificListeners) {
          for (const listener of specificListeners) {
            try {
              listener(event);
            } catch (error) {
              console.error(
                `Error in event listener for ${event.type}:`,
                error
              );
            }
          }
        }

        // Notify all listeners
        for (const listener of this.allListeners) {
          try {
            listener(event);
          } catch (error) {
            console.error("Error in global event listener:", error);
          }
        }
      }

      this.isProcessing = false;
    });
  }

  /**
   * Clear all listeners
   */
  clear(): void {
    this.listeners.clear();
    this.allListeners.clear();
    this.eventQueue = [];
  }

  /**
   * Get listener count
   */
  getListenerCount(eventType?: ErrorEvent["type"]): number {
    if (eventType) {
      return (
        (this.listeners.get(eventType)?.size || 0) + this.allListeners.size
      );
    }

    let total = this.allListeners.size;
    for (const listeners of this.listeners.values()) {
      total += listeners.size;
    }
    return total;
  }
}

/**
 * Global error event emitter
 */
export const errorEvents = new ErrorEventEmitter();

/**
 * Emit error created event
 */
export function emitErrorCreated(error: TryError): void {
  errorEvents.emit({
    type: "error:created",
    error,
    timestamp: Date.now(),
  });
}

/**
 * Emit error transformed event
 */
export function emitErrorTransformed(
  original: TryError,
  transformed: TryError
): void {
  errorEvents.emit({
    type: "error:transformed",
    original,
    transformed,
    timestamp: Date.now(),
  });
}

/**
 * Emit error pooled event
 */
export function emitErrorPooled(error: TryError): void {
  errorEvents.emit({
    type: "error:pooled",
    error,
    timestamp: Date.now(),
  });
}

/**
 * Emit error released event
 */
export function emitErrorReleased(error: TryError): void {
  errorEvents.emit({
    type: "error:released",
    error,
    timestamp: Date.now(),
  });
}

/**
 * Emit error serialized event
 */
export function emitErrorSerialized(error: TryError, serialized: any): void {
  errorEvents.emit({
    type: "error:serialized",
    error,
    serialized,
    timestamp: Date.now(),
  });
}

/**
 * Emit error wrapped event
 */
export function emitErrorWrapped(cause: unknown, error: TryError): void {
  errorEvents.emit({
    type: "error:wrapped",
    cause,
    error,
    timestamp: Date.now(),
  });
}

/**
 * Emit error retry event
 */
export function emitErrorRetry(error: TryError, attempt: number): void {
  errorEvents.emit({
    type: "error:retry",
    error,
    attempt,
    timestamp: Date.now(),
  });
}

/**
 * Emit error recovered event
 */
export function emitErrorRecovered(error: TryError, recovery: any): void {
  errorEvents.emit({
    type: "error:recovered",
    error,
    recovery,
    timestamp: Date.now(),
  });
}
