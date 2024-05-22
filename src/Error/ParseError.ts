import { EmberNexusError } from '.';

/**
 * Parse error class.
 */
class ParseError extends EmberNexusError {
  constructor(message) {
    super(message);
    this.name = 'ParseError';
  }
}

export { ParseError };
