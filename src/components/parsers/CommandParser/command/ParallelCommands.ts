import { Command } from './abstract/Command';
export class ParallelCommands extends Command {
  commands: Array<Command>;
  constructor(commands: Array<Command> = new Array()) {
    super();
    this.commands = commands;
  }
  async validate(): Promise<void> {
    for (const eachSingleCommand of this.commands)
      await eachSingleCommand.validate();
  }
}
