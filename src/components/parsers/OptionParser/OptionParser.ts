import { Optional } from './options/abstract/Optional';
import { ConfigPathOption } from './options/ConfigPathOption';

export class OptionParser {
  private static sInstance: OptionParser;
  private mOptions = {};
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
  async parseOptions() {
    const cliArguments = process.argv.slice(2);
    const optionMembers = Object.values(this).filter(
      (eachMember) => eachMember instanceof Optional,
    );
  }
}
