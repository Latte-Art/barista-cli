import { HighLighter, CommandCompletionFlag } from '../../../../module';
import { Command } from './abstract/Command';
import { SingleCommand } from './SingleCommand';
export class ParallelCommands extends Command {
  commands: Array<Command>;
  constructor(commands: Array<Command> = new Array()) {
    super();
    this.commands = commands;
  }
  async confirmCmd(): Promise<Command> {
    const confirmedCmdArray = new Array<Command>();
    for (const eachSingleCommand of this.commands)
      confirmedCmdArray.push(await eachSingleCommand.confirmCmd());
    return this;
  }

  toString(): string {
    return `{${this.commands
      .map((eachCommand) => eachCommand.toString())
      .join(', ')}}`;
  }

  async execute(): Promise<{
    exitCode: number;
    error?: Error;
  }> {
    const highLighter = await HighLighter.instance;
    highLighter.info(`Executing ${this}`);
    for (const eachCommand of this.commands) {
      const result = await eachCommand.execute();
      if (
        result.exitCode &&
        eachCommand instanceof SingleCommand &&
        eachCommand.completionFlag == CommandCompletionFlag.ESSENTIAL
      )
        return result;
    }
    return {
      exitCode: 0,
    };
  }
}
