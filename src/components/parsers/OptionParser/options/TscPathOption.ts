import { Optional, OptionConfig } from './abstract/Optional';
import path from 'path';
import fs from 'fs';
import {
  getRootDir,
  FileNotFoundError,
  InvalidFileExtensionError,
  HighLighter,
} from '../../../../module';
type TscPathValueType = {
  absolutePath: string;
  fileName: string;
};
export class TscPathOption extends Optional<TscPathValueType | undefined> {
  mIsRequired = false;
  mFlags = ['-t', '--tsc'];
  mFetchCount = 1;
  async fetchByConfig(config: OptionConfig): Promise<void> {
    if (config.tsc) {
      this.mFetchedStringArray.push(config.tsc);
      this.mIsFetched = true;
    }
  }
  async fetchByDefault(): Promise<void> {
    const defaultTscFile = path.join(getRootDir(), 'tsconfig.json');
    if (fs.existsSync(defaultTscFile)) {
      this.mFetchedStringArray.push(defaultTscFile);
      this.mIsFetched = true;
    }
  }
  async cast(fetchedStringArray: Array<string>): Promise<TscPathValueType> {
    const fetchedString = fetchedStringArray[0];
    const possibleTscPaths = Array.from(
      new Set(
        path.isAbsolute(fetchedString)
          ? [fetchedString]
          : [
              path.normalize(path.join(getRootDir(), fetchedString)),
              path.normalize(path.join(process.cwd(), fetchedString)),
            ],
      ),
    );
    const existingTscPaths = possibleTscPaths.filter((eachTscPath) =>
      fs.existsSync(eachTscPath),
    );
    if (!existingTscPaths.length)
      throw new FileNotFoundError(`No such file exists. ${fetchedString}`);
    const tscPathsMatchedExtension = existingTscPaths.filter((eachTscPath) =>
      eachTscPath.endsWith('.json'),
    );
    switch (tscPathsMatchedExtension.length) {
      case 0:
        throw new InvalidFileExtensionError(
          `File ${fetchedString} has an invalid extension. It should be .json`,
        );
      case 1:
        return {
          absolutePath: tscPathsMatchedExtension[0],
          fileName: path.basename(tscPathsMatchedExtension[0]),
        };
      default:
        const highLighter = await HighLighter.instance;
        const selectionResult = await highLighter.select(
          `There are ${tscPathsMatchedExtension.length} files detected as tsconfig.json`,
          tscPathsMatchedExtension,
        );
        if (selectionResult) {
          return {
            absolutePath: selectionResult,
            fileName: path.basename(selectionResult),
          };
        } else {
          highLighter.info(`You have canceled to select tsconfig file`);
          process.exit(0);
        }
    }
  }
  async afterEvaluate(value: TscPathValueType): Promise<void> {
    if (!Optional.config.tsc) Optional.config.tsc = value.absolutePath;
  }
}
