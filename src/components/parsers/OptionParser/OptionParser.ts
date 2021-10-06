import { Optional } from './options/abstract/Optional';
import { ConfigPathOption } from './options/ConfigPathOption';
import { TscPathOption } from './options/TscPathOption';
import { ScriptPathOption } from './options/ScriptPathOption';
import { UnknownOptionError, DuplicatedOptionError } from '../../../module';

export class OptionParser {
  private static sInstance: OptionParser;
  private mRestArgs = new Array<string>();
  static get instance(): Promise<OptionParser> {
    return new Promise(async (resolve) => {
      if (!this.sInstance) {
        this.sInstance = new OptionParser();
        await this.sInstance.init();
      }
      resolve(this.sInstance);
    });
  }
  private constructor() {}
  private async init() {}

  get restArgs(): Array<string> {
    return this.mRestArgs.slice();
  }

  configPath = new ConfigPathOption();
  tscPath = new TscPathOption();
  scriptPath = new ScriptPathOption();

  async parseOptions() {
    const optionMembers = Object.values(this).filter(
      (eachMember) => eachMember instanceof Optional,
    ) as Array<Optional<any>>;
    let args = process.argv.slice(2);
    for (const eachOption of optionMembers) args = await eachOption.fetch(args);
    const firstRestArg = args[0];
    if (firstRestArg && firstRestArg.startsWith('-')) {
      const combinedOptionFlags = optionMembers.reduce((flags, eachOption) => {
        flags.push(...eachOption.flags);
        return flags;
      }, new Array<string>());
      if (combinedOptionFlags.includes(firstRestArg))
        throw new DuplicatedOptionError(firstRestArg);
      else throw new UnknownOptionError(firstRestArg, combinedOptionFlags);
    }
    this.mRestArgs.push(...args);
  }
}
