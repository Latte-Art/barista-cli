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
export class ConfigPathOption extends Optional<ConfigPathValueType> {
  isRequired = false;
  hasValue = true;
  flags = ['-c', '--config'];
  defaultValue = async (): Promise<ConfigPathValueType | undefined> => {
    const defaultConfigFiles = fs
      .readdirSync(getRootDir())
      .filter((eachFileName) =>
        AllowedConfigExtension.checkIsDefaultFileName(eachFileName),
      );
    switch (defaultConfigFiles.length) {
      case 0:
        return undefined;
      case 1:
        const defaultConfigFile = defaultConfigFiles[0];
        return {
          absolutePath: path.join(getRootDir(), defaultConfigFile),
          fileName: defaultConfigFile,
          extension: defaultConfigFile as AllowedConfigExtension,
        };
    }
    const highLigher = await HighLighter.instance;
    const selectionResult = await highLigher.select(
      'Default configuration file is ambigious. Which one is correct?',
      defaultConfigFiles,
    );
    return selectionResult
      ? {
          absolutePath: path.join(getRootDir(), selectionResult),
          fileName: selectionResult,
          extension: selectionResult as AllowedConfigExtension,
        }
      : undefined;
  };
}
