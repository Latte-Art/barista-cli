export abstract class Command {
  abstract validate(): Promise<void>;
}
