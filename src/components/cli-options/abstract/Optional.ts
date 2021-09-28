type DefaultValueType<ValueType> =
  | ValueType
  | (() => ValueType | Promise<ValueType>);
export abstract class Optional<ValueType = boolean> {
  value!: ValueType;
  defaultValue: DefaultValueType<ValueType> | undefined;
  isRequired: boolean;
  hasValue: boolean;
  flags: Array<string> = [];
  constructor({
    isRequired = false,
    hasValue = false,
    defaultValue = undefined,
  }: {
    isRequired?: boolean;
    hasValue?: boolean;
    defaultValue?: DefaultValueType<ValueType>;
  } = {}) {
    this.isRequired = isRequired!;
    this.hasValue = hasValue!;
    this.defaultValue = defaultValue;
  }
  setFlags(...flags: Array<string>) {
    this.flags = flags;
    return this;
  }

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
}

export class SomeClass extends Optional<number> {}
const inst = new SomeClass();
console.log(inst);
