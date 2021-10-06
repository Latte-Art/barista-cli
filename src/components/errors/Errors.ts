import chalk from 'chalk';
import stringSimilarity from 'string-similarity';

const errorWordChalk = chalk.bold.magentaBright;
const recommendationChalk = chalk.bold.yellow;

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
export class DuplicatedOptionError extends BaristaError {
  constructor(duplicatedOptionFlag: string) {
    super(
      `Option flag ${errorWordChalk(
        duplicatedOptionFlag,
      )} is duplicated in command line.`,
    );
  }
}
export class UnknownOptionError extends BaristaError {
  constructor(unknownOptionFlag: string, possibleOptionFlags: Array<string>) {
    const similarFlags = stringSimilarity
      .findBestMatch(unknownOptionFlag, possibleOptionFlags)
      .ratings.filter(({ rating }) => rating > 0.4)
      .map(({ target }) => target);
    super(
      `Option flag ${errorWordChalk(unknownOptionFlag)} is unknown. ${
        similarFlags.length > 2
          ? `\nDid you mean any one of these? {${recommendationChalk(
              similarFlags,
            )}}`
          : similarFlags.length == 1
          ? `\nDid you mean ${recommendationChalk(similarFlags[0])}?`
          : ''
      }`,
    );
  }
}
export class InvalidFileExtensionError extends BaristaError {}
