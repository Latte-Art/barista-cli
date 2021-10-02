import { Optional, OptionConfig } from './abstract/Optional';
import {
  AllowedConfigExtension,
  getRootDir,
  HighLighter,
  InvalidFileExtensionError,
  FileNotFoundError,
  UnresolvedSyntaxError,
} from '../../../../module';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import { tsImport } from 'ts-import';

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
  async fetchByConfig(config: OptionConfig): Promise<void> {}
  async fetchByDefault(): Promise<void> {
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
  }

  async cast(fetchedStringArray: Array<string>): Promise<ConfigPathValueType> {
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
    const existingConfigPaths = possibleConfigPaths.filter((eachConfigPath) =>
      fs.existsSync(eachConfigPath),
    );
    if (!existingConfigPaths.length)
      throw new FileNotFoundError(`No such file exists. ${fetchedString}`);
    const configPathsMatchedExtension = existingConfigPaths.filter(
      (eachConfigPath) => AllowedConfigExtension.checkIsAllowed(eachConfigPath),
    );
    switch (configPathsMatchedExtension.length) {
      case 0:
        throw new InvalidFileExtensionError(
          `File ${fetchedString} has an invalid extension. It should be either of ${AllowedConfigExtension.list.join(
            ', ',
          )}`,
        );
      case 1:
        return {
          absolutePath: configPathsMatchedExtension[0],
          fileName: path.basename(configPathsMatchedExtension[0]),
          extension: AllowedConfigExtension.getMatchedExtension(
            configPathsMatchedExtension[0],
          ) as AllowedConfigExtension,
        };
      default:
        const highLighter = await HighLighter.instance;
        const selectionResult = await highLighter.select(
          `There are ${configPathsMatchedExtension.length} files deteced as configuration.`,
          configPathsMatchedExtension,
        );
        if (selectionResult) {
          return {
            absolutePath: selectionResult,
            fileName: path.basename(selectionResult),
            extension: AllowedConfigExtension.getMatchedExtension(
              selectionResult,
            ) as AllowedConfigExtension,
          };
        } else {
          highLighter.info('You have canceled to select config file');
          process.exit(0);
        }
    }
  }

  async afterEvaluate(value: ConfigPathValueType): Promise<void> {
    let config: any = {};
    try {
      switch (AllowedConfigExtension.getMatchedExtension(value.absolutePath)) {
        case AllowedConfigExtension.baristarc:
          config = JSON.parse(fs.readFileSync(value.absolutePath, 'utf-8'));
          break;
        case AllowedConfigExtension.baristarc_js:
        case AllowedConfigExtension.baristarc_json:
        case AllowedConfigExtension.baristarc_ts:
          if (
            AllowedConfigExtension.getMatchedExtension(value.absolutePath) ==
            AllowedConfigExtension.baristarc_ts
          )
            config = await tsImport.compile(value.absolutePath);
          else config = require(value.absolutePath);
          if (typeof config != 'object') {
            throw new UnresolvedSyntaxError(
              `The format of ${value.fileName} is not an object.`,
            );
          }
          const rootKeys = Object.keys(config);
          if (rootKeys.length == 1 && rootKeys[0] == 'default')
            config = config.default;
          else if (rootKeys.length > 1 && rootKeys.includes('default')) {
            throw new UnresolvedSyntaxError(
              `Your rc script ${value.fileName} has both default and named module exports.`,
            );
          }
          break;
        case AllowedConfigExtension.baristarc_yaml:
        case AllowedConfigExtension.baristarc_yml:
          config = yaml.parse(fs.readFileSync(value.absolutePath, 'utf-8'));
          break;
      }
    } catch (error) {
      throw new UnresolvedSyntaxError(
        `Cannot parse ${value.fileName}, ${(error as any).message}`,
      );
    }
    Optional.config = config;
    return;
  }
}
