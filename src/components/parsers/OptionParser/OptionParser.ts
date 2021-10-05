import { Optional } from './options/abstract/Optional';
import { ConfigPathOption } from './options/ConfigPathOption';
import { TscPathOption } from './options/TscPathOption';
import { ScriptPathOption } from './options/ScriptPathOption';

export class OptionParser {
  private static sInstance: OptionParser;
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

  configPath = new ConfigPathOption();
  tscPath = new TscPathOption();
  scriptPath = new ScriptPathOption();

  async parseOptions() {
    const optionMembers = Object.values(this).filter(
      (eachMember) => eachMember instanceof Optional,
    ) as Array<Optional<any>>;
    let args = process.argv.slice(2);
    for (const eachOption of optionMembers) args = await eachOption.fetch(args);
    console.log(optionMembers);
  }
}
