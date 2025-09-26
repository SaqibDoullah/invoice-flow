import { EventEmitter } from 'events';
import { FirestorePermissionError } from './firebase-errors';

type ErrorEvents = {
  'permission-error': (error: FirestorePermissionError) => void;
};

// We must use a declare to augment the EventEmitter type, as we cannot subclass it in a client component
declare interface ErrorEmitter {
  on<E extends keyof ErrorEvents>(event: E, listener: ErrorEvents[E]): this;
  emit<E extends keyof ErrorEvents>(
    event: E,
    ...args: Parameters<ErrorEvents[E]>
  ): boolean;
}

class ErrorEmitter extends EventEmitter {}

export const errorEmitter = new ErrorEmitter();
