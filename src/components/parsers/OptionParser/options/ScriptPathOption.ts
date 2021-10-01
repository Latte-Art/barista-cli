export const tmp = 'tmp';
/*
import { Optional } from './abstract/Optional';
import {
  AllowedScriptExtension,
  getRootDir,
  HighLighter,
} from '../../../../module';
import fs from 'fs';
import path from 'path';
type ScriptPathValueType = {
  absolutePath: string;
  fileName: string;
  extension: AllowedScriptExtension;
};
export class ScriptPathOption extends Optional<ScriptPathValueType> {
  mIsRequired = true;
  mFetchCount = 1;
  mFlags = ['-s', '--script'];
  fetchByCli(argv: Array<string>): Promise<void> {
    return new Promise(async (resolve, reject) => {});
  }
  fetchByConfig(): Promise<void> {
    return new Promise(async (resolve, reject) => {});
  }
  fetchByDefault(): Promise<void> {
    return new Promise(async (resolve, reject) => {});
  }

  
  mDefaultValue = async (): Promise<ScriptPathValueType | undefined> => {
    const defaultScriptFiles = fs
      .readdirSync(getRootDir())
      .filter((eachFileName) =>
        AllowedScriptExtension.checkIsDefaultFileName(eachFileName),
      );
    switch (defaultScriptFiles.length) {
      case 0:
        return undefined;
      case 1:
        const defaultScriptFile = defaultScriptFiles[0];
        return {
          absolutePath: path.join(getRootDir(), defaultScriptFile),
          fileName: defaultScriptFile,
          extension: defaultScriptFile
            .split('.')
            .pop() as AllowedScriptExtension,
        };
    }
    const highLigher = await HighLighter.instance;
    const selectionResult = await highLigher.select(
      'Default configuration file is ambigious. Which one is correct?',
      defaultScriptFiles,
    );
    return selectionResult
      ? {
          absolutePath: path.join(getRootDir(), selectionResult),
          fileName: selectionResult,
          extension: selectionResult.split('.').pop() as AllowedScriptExtension,
        }
      : undefined;
  };
  
}
*/
