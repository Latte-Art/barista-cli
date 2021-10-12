import { Command } from './abstract/Command';
import {
  StringIndexPair,
  ScriptParser,
  CommandCompletionFlag,
  HighLighter,
  getTerminalWidth,
  UnresolvedSyntaxError,
} from '../../../../module';
import { SequentialCommands } from '../command/SequencialCommands';
import wcMatch from 'wildcard-match';
import chalk from 'chalk';
import stripColor from 'strip-color';
import { spawn } from 'child_process';
export class SingleCommand extends Command {
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
    const splittedValues = stringPair.value.split(' ');
    this.initialIndex = stringPair.index;
    this.commandString = splittedValues.shift()!;
    this.args = splittedValues.join(' ');
  }

  private setUseSpreader() {
    if (this.commandString.startsWith(SingleCommand.KEYWORD_SPREADER)) {
      this.useSpreader = true;
      this.commandString = this.commandString.slice(
        SingleCommand.KEYWORD_SPREADER.length,
      );
    }
  }

  private setCompletionFlag() {
    const lastCmdCharacter = this.commandString[this.commandString.length - 1];
    if (
      lastCmdCharacter == SingleCommand.KEYWORD_OPTIONAL ||
      lastCmdCharacter == SingleCommand.KEYWORD_ESSNTIAL
    ) {
      this.completionFlag =
        lastCmdCharacter == SingleCommand.KEYWORD_OPTIONAL
          ? CommandCompletionFlag.OPTIONAL
          : CommandCompletionFlag.ESSENTIAL;
      this.commandString = this.commandString.slice(0, -1);
    }
  }

  private async getSplittedCmd() {
    const highLighter = await HighLighter.instance;
    return (
      this.commandString
        .split(SingleCommand.KEYWORD_SEPERATOR)
        .map((eachCommand) =>
          eachCommand.split(new RegExp(`(?=${SingleCommand.KEYWORD_INDEX})`)),
        )
        .flat(
          Object.values(SingleCommand).filter(
            (eachPref) => typeof eachPref === 'string',
          ).length,
        ) as Array<string>
    ).map((eachCommand) => {
      const currentCommandPosition =
        this.initialIndex + this.commandString.indexOf(eachCommand);
      if (
        eachCommand.startsWith(SingleCommand.KEYWORD_INDEX) &&
        Number.isNaN(Number(eachCommand.slice(1)))
      )
        throw new UnresolvedSyntaxError(
          `Invalid input command key. "${eachCommand.slice(
            1,
          )}" is not a number. \n${highLighter.highlightByRange(
            currentCommandPosition,
            currentCommandPosition + eachCommand.length,
          )}`,
        );
      return new StringIndexPair(currentCommandPosition, eachCommand);
    });
  }

  constructor(stringPair: StringIndexPair) {
    super();
    this.setCommandStringAndArgs(stringPair);
    this.setUseSpreader();
    this.setCompletionFlag();
  }

  async confirmCmd(): Promise<Command> {
    const commandToUse = this.commandString.startsWith('.')
      ? `**${this.commandString}`
      : this.commandString;
    const highLighter = await HighLighter.instance;
    const scriptParser = await ScriptParser.instance;
    const wildCardMatcher = wcMatch(commandToUse, { separator: '.' });
    const scriptPairs = scriptParser.flattenedScriptObject;

    let matchedScriptKeys = Object.keys(scriptPairs).filter((eachScriptKey) =>
      wildCardMatcher(eachScriptKey),
    );
    if (!matchedScriptKeys.length) {
      const advancedWildCardMatcher = wcMatch(
        `${commandToUse}${commandToUse.endsWith('.') ? '' : '.'}**`,
        {
          separator: '.',
        },
      );
      matchedScriptKeys = Object.keys(scriptPairs).filter((eachScriptKey) =>
        advancedWildCardMatcher(eachScriptKey),
      );
    }
    switch (matchedScriptKeys.length) {
      case 0:
        throw new UnresolvedSyntaxError(
          `Cannot find script matches "${this.commandString}"`,
        );
      case 1:
        this.commandString = matchedScriptKeys[0];
        break;
      default:
        if (this.useSpreader) {
          const completionFlag =
            this.completionFlag == CommandCompletionFlag.ESSENTIAL
              ? SingleCommand.KEYWORD_ESSNTIAL
              : this.completionFlag == CommandCompletionFlag.OPTIONAL
              ? SingleCommand.KEYWORD_OPTIONAL
              : '';
          const commands = matchedScriptKeys.map(
            (eachScriptKey) =>
              new SingleCommand(
                new StringIndexPair(
                  this.initialIndex,
                  `${eachScriptKey}${completionFlag} ${this.args}`,
                ),
              ),
          );
          return new SequentialCommands(commands);
        } else {
          const terminalSize = getTerminalWidth();
          const selectionResult = await highLighter.select(
            `There are ${matchedScriptKeys.length} script keys match "${this.commandString}".`,
            matchedScriptKeys,
            (scriptKey) => {
              const scriptValue = scriptPairs[scriptKey];
              const scriptValueString = `${
                scriptValue['description']
                  ? scriptValue['description']
                  : scriptValue
              }`
                .replace(/[\r\n]/g, '')
                .replace(/ +(?= )/g, '');
              return `${scriptKey} : ${chalk.gray(
                `${
                  scriptValueString.length + stripColor(scriptKey).length >
                  terminalSize
                    ? `${scriptValueString.slice(
                        0,
                        terminalSize - stripColor(scriptKey).length,
                      )}...`
                    : scriptValueString
                }`,
              )}`;
            },
          );
          if (selectionResult) this.commandString = selectionResult;
          else {
            highLighter.info('You have canceled to select script');
            process.exit(0);
          }
        }
        break;
    }
    return this;
  }

  toString(): string {
    return `${chalk.yellow(this.commandString)} ${chalk.magentaBright(
      this.args,
    )}`;
  }

  execute(): Promise<{
    exitCode: number;
    error?: Error;
  }> {
    return new Promise(async (resolve) => {
      try {
        const highLighter = await HighLighter.instance;
        const scriptParser = await ScriptParser.instance;
        const scriptPairs = scriptParser.flattenedScriptObject;
        highLighter.info(`Executing ${this}`);
        let passArgument = false;
        let script = scriptPairs[this.commandString];
        if (typeof script == 'string') passArgument = true;
        else script = script(this.args.split(' '));
        const process = spawn(
          script,
          passArgument ? this.args.split(' ') : [],
          {
            shell: true,
            stdio: 'inherit',
          },
        );
        process.on('exit', (exitCode) =>
          resolve({
            exitCode: exitCode ? exitCode : 0,
          }),
        );
        process.on('error', (error) => {
          resolve({
            exitCode: 1,
            error: error,
          });
        });
      } catch (error) {
        resolve({
          exitCode: 1,
          error: error as Error,
        });
      }
    });
  }
}
