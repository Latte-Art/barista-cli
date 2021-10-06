import { MissingRequiredOptionError } from '../../../../../module';
export type OptionConfig = {
  script?: string;
  tsc?: string;
};
export abstract class Optional<ValueType> {
  protected static config: OptionConfig = {};

  protected abstract mIsRequired: boolean;
  protected abstract mFlags: Array<string>;
  protected abstract mFetchCount: number | undefined;

  protected abstract fetchByConfig(config: OptionConfig): Promise<void>;
  protected abstract fetchByDefault(): Promise<void>;
  protected abstract cast(
    fetchedStringArray: Array<string>,
  ): Promise<ValueType>;
  protected abstract afterEvaluate(value: ValueType): Promise<void>;

  protected mIsFetched = false;
  protected mFetchedStringArray = new Array<string>();

  value!: ValueType;

  get flags(): Array<string> {
    return this.mFlags;
  }
  get undefinedErrorMessage(): string {
    return 'Unimplemented undefined error message';
  }

  async fetch(argv: Array<string>): Promise<Array<string>> {
    argv = await this.parse(argv);
    if (!this.mIsFetched) await this.fetchByConfig(Optional.config);
    if (!this.mIsFetched) await this.fetchByDefault();
    if (!this.mIsFetched && this.mIsRequired)
      throw new MissingRequiredOptionError(this.undefinedErrorMessage);
    if (this.mIsFetched) {
      this.value = await this.cast(this.mFetchedStringArray);
      await this.afterEvaluate(this.value);
    }
    return argv;
  }

  private parse(argv: Array<string>): Promise<Array<string>> {
    return new Promise((resolve, reject) => {
      const foundIndex = argv.findIndex((arg) =>
        this.mFlags.includes(arg.toLowerCase()),
      );
      if (foundIndex == -1) {
        resolve(argv);
        return;
      }
      switch (this.mFetchCount) {
        case 0:
          this.mIsFetched = true;
          argv.splice(foundIndex, 1);
          break;
        default:
          let fetchCountOnDefaultLength = 0;
          do {
            fetchCountOnDefaultLength++;
            const arg = argv[foundIndex + fetchCountOnDefaultLength];
            if (!arg || arg.startsWith('-')) {
              fetchCountOnDefaultLength--;
              break;
            }
          } while (
            this.mIsFetched == undefined
              ? true
              : fetchCountOnDefaultLength < this.mFetchCount!
          );
          this.mFetchedStringArray.push(
            ...argv.slice(
              foundIndex + 1,
              foundIndex + fetchCountOnDefaultLength + 1,
            ),
          );
          argv.splice(foundIndex, fetchCountOnDefaultLength + 1);
          this.mIsFetched = true;
          break;
      }
      resolve(argv);
      return;
    });
  }
}
