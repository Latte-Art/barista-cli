import {
  OptionParser,
  HighLighter,
  StringIndexPairInInputCommand,
  UnresolvedSyntaxError,
  CommandKeyword,
} from '../../../module';

export class CommandParser {
  private static sInstance: CommandParser;
  private mOptionParser!: OptionParser;
  private mHighLighter!: HighLighter;
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

  private getMappedArgsAsPair(): Array<StringIndexPairInInputCommand> {
    const argString = this.mOptionParser.restArgs.join(' ').trim();
    if (!argString.length) return new Array();
    const ignoreCount = this.mHighLighter.inputCommand.indexOf(argString);
    return argString
      .split('')
      .map(
        (eachValue, index) =>
          new StringIndexPairInInputCommand(ignoreCount + index, eachValue),
      );
  }

  private checkBracketSyntax(
    mappedArgsAsPair: Array<StringIndexPairInInputCommand>,
  ) {
    const incorrectOpenBrackets = mappedArgsAsPair
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
            console.log(eachPair);
            console.log(
              this.mHighLighter.highlightByRange(
                eachPair.index,
                eachPair.lastIndex,
              ),
            );
            process.exit(0);
            /*
            throw new UnresolvedSyntaxError(`Incorrect closing bracket.
            \n ${this.mHighLighter.}`);
            */
          }
        }
        return stack;
      }, new Array<StringIndexPairInInputCommand>());
  }

  async parseCommands() {
    const mappedArgsAsPair = this.getMappedArgsAsPair();
    this.checkBracketSyntax(mappedArgsAsPair);
  }
}
