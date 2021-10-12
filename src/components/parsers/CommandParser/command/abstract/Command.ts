export abstract class Command {
  abstract confirmCmd(): Promise<Command>;
  abstract execute(): Promise<{
    exitCode: number;
    error?: Error;
  }>;
}
