import chalk from 'chalk';
import cliSelect from 'cli-select';

export class StringIndexPair {
  private mIndex: number;
  private mValue: string;
  get index(): number {
    return this.mIndex;
  }
  get value(): string {
    return this.mValue;
  }
  get lastIndex(): number {
    return this.mIndex + this.value.length - 1;
  }
  concat(...assets: Array<string | StringIndexPair>): StringIndexPair {
    assets.forEach((asset) => {
      this.mValue += typeof asset == 'string' ? asset : asset.value;
    });
    return this;
  }
  trim(): StringIndexPair {
    this.mIndex += this.mValue.length - this.mValue.trimLeft().length;
    this.mValue = this.mValue.trim();
    return this;
  }
  constructor(index: number, value: string) {
    this.mIndex = index;
    this.mValue = value;
  }
}

export class HighLighter {
  private static sInstance: HighLighter;
  inputCommand = `barista ${process.argv.slice(2).join(' ')}` as const;
  static get instance(): Promise<HighLighter> {
    return new Promise(async (resolve) => {
      if (!this.sInstance) {
        this.sInstance = new HighLighter();
      }
      resolve(this.sInstance);
    });
  }
  private constructor() {
    console.log(this.inputCommand);
  }
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

  highlightByRange(
    from: number,
    to: number,
    sentence: string = this.inputCommand,
  ): string {
    return (
      sentence.substring(0, from) +
      chalk.bgMagenta(sentence.substring(from, to + 1)) +
      sentence.substring(to + 1)
    );
  }

  highlightByPoints(
    points: number[],
    sentence: string = this.inputCommand,
  ): string {
    return sentence
      .split('')
      .map((eachValue, index) =>
        points.includes(index) ? chalk.bgMagenta(eachValue) : eachValue,
      )
      .join('');
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
