import {
  OptionParser,
  HighLighter,
  StringIndexPair,
  UnresolvedSyntaxError,
  CommandKeyword,
} from '../../../module';
import { Command } from './command/abstract/Command';
import { SingleCommand } from './command/SingleCommand';
import { SequentialCommands } from './command/SequencialCommands';
import { ParallelCommands } from './command/ParallelCommands';

export class CommandParser {
  private static sInstance: CommandParser;
  private mOptionParser!: OptionParser;
  private mHighLighter!: HighLighter;
  private mCommands!: SequentialCommands;
  static get instance(): Promise<CommandParser> {
    return new Promise(async (resolve) => {
      if (!this.sInstance) {
        this.sInstance = new CommandParser();
        await this.sInstance.init();
      }
      resolve(this.sInstance);
    });
  }
  private constructor() {}
  private async init() {
    this.mOptionParser = await OptionParser.instance;
    this.mHighLighter = await HighLighter.instance;
  }

  private getMappedArgsAsPair(): Array<StringIndexPair> {
    const argString = this.mOptionParser.restArgs.join(' ').trim();
    if (!argString.length) return new Array();
    const ignoreCount = this.mHighLighter.inputCommand.indexOf(argString);
    return argString
      .split('')
      .map(
        (eachValue, index) =>
          new StringIndexPair(ignoreCount + index, eachValue),
      );
  }

  private checkBracketSyntax(mappedArgsAsPair: Array<StringIndexPair>) {
    const incorrectOpeningBrackets = mappedArgsAsPair
      .filter((eachPair) =>
        Object.values(CommandKeyword)
          .filter((eachKeyword) => eachKeyword != CommandKeyword.SEPERATOR)
          .map((eachKeyword) => eachKeyword.toString())
          .includes(eachPair.value),
      )
      .reduce((stack, eachPair) => {
        if (
          eachPair.value === CommandKeyword.OPEN_SEQUENCE ||
          eachPair.value === CommandKeyword.OPEN_PARALLEL
        )
          stack.push(eachPair);
        else {
          const top = stack.pop();
          if (
            top === undefined ||
            (eachPair.value === CommandKeyword.CLOSE_PARALLEL &&
              top.value !== CommandKeyword.OPEN_PARALLEL) ||
            (eachPair.value === CommandKeyword.CLOSE_SEQUENCE &&
              top.value !== CommandKeyword.OPEN_SEQUENCE)
          ) {
            throw new UnresolvedSyntaxError(
              `Incorrect closing bracket.\n${this.mHighLighter.highlightByPoints(
                [eachPair.index],
              )}`,
            );
          }
        }
        return stack;
      }, new Array<StringIndexPair>());
    if (incorrectOpeningBrackets.length)
      throw new Error(
        `Incorrect opening brackets. \n${this.mHighLighter.highlightByPoints(
          incorrectOpeningBrackets.map(
            (eachIncorrectOpeningBracket) => eachIncorrectOpeningBracket.index,
          ),
        )}`,
      );
  }

  async parseCommands() {
    const mappedArgsAsPair = this.getMappedArgsAsPair();
    this.checkBracketSyntax(mappedArgsAsPair);
    const commandKeywordStrings = Object.values(CommandKeyword).map(
      (eachKeyword) => eachKeyword.toString(),
    );
    this.mCommands = new SequentialCommands(
      mappedArgsAsPair
        .reduce((stack, eachPair) => {
          if (commandKeywordStrings.includes(eachPair.value))
            stack.push(eachPair);
          else {
            const topPair = stack[stack.length - 1];
            if (!topPair || commandKeywordStrings.includes(topPair.value))
              stack.push(eachPair);
            else topPair.concat(eachPair);
          }
          return stack;
        }, new Array<StringIndexPair>())
        .map((eachPair) => eachPair.trim())
        .filter(
          (eachPair) =>
            eachPair.value != '' && eachPair.value != CommandKeyword.SEPERATOR,
        )
        .reduce((stack, eachPair) => {
          if (commandKeywordStrings.includes(eachPair.value)) {
            switch (eachPair.value) {
              case CommandKeyword.OPEN_SEQUENCE:
              case CommandKeyword.OPEN_PARALLEL:
                stack.push(eachPair.value);
                break;
              case CommandKeyword.CLOSE_SEQUENCE:
                const sequential = new SequentialCommands();
                while (true) {
                  const top = stack.pop();
                  if (
                    typeof top == 'string' &&
                    top == CommandKeyword.OPEN_SEQUENCE
                  )
                    break;
                  sequential.commands.unshift(top as Command);
                }
                stack.push(sequential);
                break;
              case CommandKeyword.CLOSE_PARALLEL:
                const parallel = new ParallelCommands();
                while (true) {
                  const top = stack.pop();
                  if (
                    typeof top == 'string' &&
                    top == CommandKeyword.OPEN_PARALLEL
                  )
                    break;
                  parallel.commands.unshift(top as Command);
                }
                stack.push(parallel);
                break;
            }
          } else stack.push(new SingleCommand(eachPair));
          return stack;
        }, new Array<CommandKeyword | Command>()) as Array<Command>,
    );
    if (!this.mCommands.commands.length) {
      this.mCommands.commands.push(
        new SingleCommand(
          new StringIndexPair(this.mHighLighter.inputCommand.length, '.'),
        ),
      );
    }
    await this.mCommands.confirmCmd();
  }

  async executeCommands() {
    await this.mCommands.execute();
  }
}
