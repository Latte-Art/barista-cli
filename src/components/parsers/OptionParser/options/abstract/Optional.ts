type DefaultValueType<ValueType> =
  | ValueType
  | (() => ValueType | Promise<ValueType>);

export abstract class Optional<ValueType = boolean> {
  abstract isRequired: boolean;
  abstract hasValue: boolean;
  abstract flags: Array<string>;

  abstract defaultValue: DefaultValueType<ValueType | undefined>;

  /*
  constructor({
    errorStringOnUndefined = undefined,
    isRequired = false,
    hasValue = false,
    defaultValue = undefined,
  }: {
    errorStringOnUndefined?: string | undefined;
    isRequired?: boolean;
    hasValue?: boolean;
    defaultValue?: DefaultValueType<ValueType>;
  } = {}) {
    this.errorStringOnUndefined = errorStringOnUndefined;
    this.isRequired = isRequired!;
    this.hasValue = hasValue!;
    this.defaultValue = defaultValue;
  }
  */

  /*
  async fetch(argv: Array<string>): Promise<Array<string>> {
    let isFound = false;
    let foundValue = '';
    for (const eachFlag of this.flags) {
      const foundIndex = argv.findIndex((eachArgv) => eachArgv == eachFlag);
      if (foundIndex != -1) {
        isFound = true;
        let spliceCount = 1;
        if (this.hasValue) {
          foundValue = argv[foundIndex + 1];
          spliceCount++;
        }
        argv.splice(foundIndex, spliceCount);
        break;
      }
    }
    if (!isFound) {
      if (this.isRequired) {
        throw new Error();
      } else {
        return argv;
      }
    }
    return [];
  }
  */
}
