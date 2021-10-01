import { Optional } from './abstract/Optional';
import {
  AllowedConfigExtension,
  getRootDir,
  HighLighter,
} from '../../../../module';
import fs from 'fs';
import path from 'path';

type ConfigPathValueType = {
  absolutePath: string;
  fileName: string;
  extension: AllowedConfigExtension;
};
export class ConfigPathOption extends Optional<
  ConfigPathValueType | undefined
> {
  mIsRequired = false;
  mFlags = ['-c', '--config'];
  mFetchCount = 1;
  fetchByConfig(): Promise<void> {
    return new Promise(async (resolve) => {
      resolve();
    });
  }
  fetchByDefault(): Promise<void> {
    return new Promise(async (resolve) => {
      const defaultConfigFiles = fs
        .readdirSync(getRootDir())
        .filter((eachFileName) =>
          AllowedConfigExtension.checkIsDefaultFileName(eachFileName),
        );
      switch (defaultConfigFiles.length) {
        case 0:
          break;
        case 1:
          this.mFetchedStringArray.push(
            path.join(getRootDir(), defaultConfigFiles[0]),
          );
          this.mIsFetched = true;
          break;
        default:
          const highLigher = await HighLighter.instance;
          const selectionResult = await highLigher.select(
            `There are ${defaultConfigFiles.length} files detected as default configuration.`,
            defaultConfigFiles,
          );
          if (selectionResult) {
            this.mFetchedStringArray.push(
              path.join(getRootDir(), selectionResult),
            );
            this.mIsFetched = true;
          }
          break;
      }

      resolve();
    });
  }

  cast(fetchedStringArray: Array<string>): Promise<ConfigPathValueType> {
    return new Promise(async (resolve, reject) => {
      const fetchedString = fetchedStringArray[0];
      const possibleConfigPaths = Array.from(
        new Set(
          path.isAbsolute(fetchedString)
            ? [fetchedString]
            : [
                path.normalize(path.join(getRootDir(), fetchedString)),
                path.normalize(path.join(process.cwd(), fetchedString)),
              ],
        ),
      );
      const existsConfigPaths = possibleConfigPaths.filter((eachConfigPath) =>
        fs.existsSync(eachConfigPath),
      );
      if (!existsConfigPaths.length) {
        reject(new Error(`No such file exists. ${fetchedString}`));
        return;
      }
      const configPathsMatchedExtension = existsConfigPaths.filter(
        (eachConfigPath) =>
          AllowedConfigExtension.checkIsAllowed(eachConfigPath),
      );
      switch (configPathsMatchedExtension.length) {
        case 0:
          reject(
            new Error(
              `File ${fetchedString} has an invalid extension. It should be either of ${AllowedConfigExtension.list.join(
                ', ',
              )}`,
            ),
          );
          return;
        case 1:
          resolve({
            absolutePath: configPathsMatchedExtension[0],
            fileName: path.basename(configPathsMatchedExtension[0]),
            extension: AllowedConfigExtension.getMatchedExtension(
              configPathsMatchedExtension[0],
            ) as AllowedConfigExtension,
          });
          return;
        default:
          const highLighter = await HighLighter.instance;
          const selectionResult = await highLighter.select(
            `There are ${configPathsMatchedExtension.length} files deteced as configuration.`,
            configPathsMatchedExtension,
          );
          if (selectionResult) {
            resolve({
              absolutePath: selectionResult,
              fileName: path.basename(selectionResult),
              extension: AllowedConfigExtension.getMatchedExtension(
                selectionResult,
              ) as AllowedConfigExtension,
            });
            return;
          } else {
            highLighter.info('You have canceled to select config file');
            process.exit(0);
          }
      }
    });
  }
}
