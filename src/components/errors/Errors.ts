class BaristaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name.split(/(?=[A-Z])/).join(' ');
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnresolvedSyntaxError extends BaristaError {}
export class FileNotFoundError extends BaristaError {}
export class MissingRequiredOptionError extends BaristaError {}
export class InvalidFileExtensionError extends BaristaError {}
