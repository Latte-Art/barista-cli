import { KoconutArray } from 'koconut';
export class ScriptParser {
  private static sInstance: ScriptParser;
  private mScriptObject: any;
  private mFlattenedScriptObject: any;
  static get instance(): Promise<ScriptParser> {
    return new Promise(async (resolve) => {
      if (!this.sInstance) {
        this.sInstance = new ScriptParser();
        await this.sInstance.init();
      }
      resolve(this.sInstance);
    });
  }
  private constructor() {}
  private async init() {}
  private setScriptObject(scriptObject: any) {
    this.mScriptObject = scriptObject;
    this.mFlattenedScriptObject = this.flatten(
      this.mScriptObject,
      Array.isArray(this.mScriptObject) ? '#' : '',
    );
  }
  get scriptObject() {
    return this.mScriptObject;
  }

  private flatten(targetObject: any, prefix: string) {
    return Object.keys(targetObject).reduce((resultObject: any, key) => {
      const value = targetObject[key];
      const valueType = typeof value;
      switch (true) {
        case valueType == 'string' ||
          valueType == 'function' ||
          value instanceof KoconutArray:
          resultObject[`${prefix}${key}`] = value;
          break;
        case valueType == 'object' && value != null:
          if (Array.isArray(value))
            resultObject = {
              ...resultObject,
              ...this.flatten(value, `${prefix}${key}.#`),
            };
          else
            resultObject = {
              ...resultObject,
              ...this.flatten(value, `${prefix}${key}.`),
            };
          break;
        default:
          throw new Error(
            `script value '${value}' of ${prefix}${key} is not allowed. ${
              value == null || valueType == 'undefined'
                ? ''
                : `You cannot use '${valueType}' in barista script.`
            }\nIt can only be either a simple command string or function, which returns it.`,
          );
      }
      return resultObject;
    }, {});
  }

  get flattenedScriptObject() {
    return this.mFlattenedScriptObject;
  }
}
