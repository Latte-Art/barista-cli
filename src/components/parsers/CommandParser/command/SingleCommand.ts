import { Command } from './abstract/Command';
import {
  StringIndexPair,
  ScriptParser,
  CommandCompletionFlag,
} from '../../../../module';
import wcMatch from 'wildcard-match';
export class SingleCommnad extends Command {
  private static KEYWORD_SPREADER = '...';
  private static KEYWORD_SEPERATOR = '.';
  private static KEYWORD_INDEX = '#';
  private static KEYWORD_OPTIONAL = '~';
  private static KEYWORD_ESSNTIAL = '!';

  commandString!: string;
  args!: string;
  initialIndex!: number;

  useSpreader = false;
  completionFlag = CommandCompletionFlag.NEUTRAL;

  private setCommandStringAndArgs(stringPair: StringIndexPair) {
    const splitedValue = stringPair.value.split(' ');
    this.initialIndex = stringPair.index;
    this.commandString = splitedValue.shift()!;
    this.args = splitedValue.join(' ');
  }

  private setUseSpreader() {
    if (this.commandString.startsWith(SingleCommnad.KEYWORD_SPREADER)) {
      this.useSpreader = true;
      this.commandString = this.commandString.slice(
        SingleCommnad.KEYWORD_SPREADER.length,
      );
    }
  }

  private setCompletionFlag() {
    const lastCmdCharacter = this.commandString[this.commandString.length - 1];
    if (
      lastCmdCharacter == SingleCommnad.KEYWORD_OPTIONAL ||
      lastCmdCharacter == SingleCommnad.KEYWORD_ESSNTIAL
    ) {
      this.completionFlag =
        lastCmdCharacter == SingleCommnad.KEYWORD_OPTIONAL
          ? CommandCompletionFlag.OPTIONAL
          : CommandCompletionFlag.ESSENTIAL;
      this.commandString = this.commandString.slice(0, -1);
    }
  }

  constructor(stringPair: StringIndexPair) {
    super();
    this.setCommandStringAndArgs(stringPair);
    this.setUseSpreader();
    this.setCompletionFlag();
  }

  async validate(): Promise<void> {
    const scriptParser = await ScriptParser.instance;
    console.log(scriptParser.flattenedScriptObject);
    /*
    const matcher = wcMatch('**', { separator: '.' });
    const tmp = Object.keys(scriptParser.flattenedScriptObject).filter((e) =>
      matcher(e),
    );
    console.log(tmp);
    */
  }
}
