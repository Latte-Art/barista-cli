import chalk from 'chalk';
import cliSelect from 'cli-select';

export class HighLighter {
  private static sInstance: HighLighter;
  static get instance(): Promise<HighLighter> {
    return new Promise(async (resolve) => {
      if (!this.sInstance) {
        this.sInstance = new HighLighter();
      }
      resolve(this.sInstance);
    });
  }
  private constructor() {}
  private get cliName() {
    return chalk.rgb(205, 133, 63).bold('Barista');
  }
  info(...data: any[]) {
    console.info(this.cliName, chalk.bold.blue('Info'), '--', chalk.cyan(data));
  }
  error(...data: any) {
    console.error(
      this.cliName,
      chalk.bold.red('Error'),
      '--',
      chalk.redBright(data),
    );
  }
  async select<ValueType>(
    initialString: string,
    values: Array<ValueType>,
  ): Promise<ValueType | undefined> {
    this.info(initialString);
    const selectedIndex = (
      await cliSelect({
        values: [
          ...values.map((eachValue) => chalk.green(eachValue)),
          chalk.magenta('Cancel'),
        ],
        selected: `(${chalk.greenBright('✔')})`,
        valueRenderer: (value, selected) =>
          selected ? chalk.underline(value) : value,
      })
    ).id as number;
    console.clear();
    return selectedIndex == values.length ? undefined : values[selectedIndex];
  }
}
