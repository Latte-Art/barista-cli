import { Optional, OptionConfig } from './abstract/Optional';
import {
  AllowedScriptExtension,
  getRootDir,
  FileNotFoundError,
} from '../../../../module';
import path from 'path';
import fs from 'fs';
type ScriptPathValueType = {
  absolutePath: string;
  fileName: string;
  extension: AllowedScriptExtension;
};
export class ScriptPathOption extends Optional<ScriptPathValueType> {
  mIsRequired = true;
  mFlags = ['-s', '--script'];
  mFetchCount = 1;
  get undefinedErrorMessage(): string {
    return 'Script option is missing. You can set it by type "barista -s yourScript.js" or create default script file in your root dir. (i.e, .barista.js)';
  }
  async fetchByConfig(config: OptionConfig): Promise<void> {}
  async fetchByDefault(): Promise<void> {}
  async cast(fetchedStringArray: Array<string>): Promise<ScriptPathValueType> {
    const fetchedString = fetchedStringArray[0];
    const possiblePaths = Array.from(
      new Set(
        path.isAbsolute(fetchedString)
          ? [fetchedString]
          : [
              path.normalize(path.join(getRootDir(), fetchedString)),
              path.normalize(path.join(process.cwd(), fetchedString)),
            ],
      ),
    );
    const existingScriptPaths = possiblePaths.filter((eachScriptPath) =>
      fs.existsSync(eachScriptPath),
    );
    if (!existingScriptPaths.length)
      throw new FileNotFoundError(`No such file exists. ${fetchedString}`);
    const scriptPathsMatchedExtension = existingScriptPaths.filter(
      (eachScriptPath) => AllowedScriptExtension.checkIsAllowed(eachScriptPath),
    );
    return {
      absolutePath: 'tmp',
      fileName: 'tmp',
      extension: AllowedScriptExtension.js,
    };
  }
  async afterEvaluate(value: ScriptPathValueType): Promise<void> {}
}
