import { Optional, OptionConfig } from './abstract/Optional';
import {
  AllowedScriptExtension,
  getRootDir,
  FileNotFoundError,
  UnresolvedSyntaxError,
  ScriptParser,
} from '../../../../module';
import path from 'path';
import fs from 'fs';
import yaml from 'yaml';
import { InvalidFileExtensionError } from '../../../errors/Errors';
import { HighLighter } from '../../../HighLighter';
import { tsImport, Compiler } from 'ts-import';
import { KoconutArray } from 'koconut';
type ScriptPathValueType = {
  absolutePath: string;
  fileName: string;
  extension: AllowedScriptExtension;
};
export class ScriptPathOption extends Optional<ScriptPathValueType> {
  mIsRequired = true;
  mFlags = ['--barista-script'];
  mFetchCount = 1;
  get undefinedErrorMessage(): string {
    return 'Script option is missing. You can set it by type "barista -s yourScript.js" or create default script file in your root dir. (i.e, .barista.js)';
  }
  async fetchByConfig(config: OptionConfig): Promise<void> {
    if (config.script) {
      this.mFetchedStringArray.push(config.script);
      this.mIsFetched = true;
    }
  }
  async fetchByDefault(): Promise<void> {
    const defaultScriptFiles = fs
      .readdirSync(getRootDir())
      .filter((eachFileName) =>
        AllowedScriptExtension.checkIsDefaultFileName(eachFileName),
      );
    switch (defaultScriptFiles.length) {
      case 0:
        break;
      case 1:
        this.mFetchedStringArray.push(
          path.join(getRootDir(), defaultScriptFiles[0]),
        );
        this.mIsFetched = true;
        break;
      default:
        const highLighter = await HighLighter.instance;
        const selectionResult = await highLighter.select(
          `There are ${defaultScriptFiles.length} files detected as default script.`,
          defaultScriptFiles,
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
    switch (scriptPathsMatchedExtension.length) {
      case 0:
        throw new InvalidFileExtensionError(
          `File ${fetchedString} has an invalid extension. It should be either of ${AllowedScriptExtension.list.join(
            ', ',
          )}`,
        );
      case 1:
        return {
          absolutePath: scriptPathsMatchedExtension[0],
          fileName: path.basename(scriptPathsMatchedExtension[0]),
          extension: AllowedScriptExtension.getMatchedExtension(
            scriptPathsMatchedExtension[0],
          ) as AllowedScriptExtension,
        };
      default:
        const highLighter = await HighLighter.instance;
        const selectionResult = await highLighter.select(
          `There are ${scriptPathsMatchedExtension.length} files detected as script input.`,
          scriptPathsMatchedExtension,
        );
        if (selectionResult) {
          return {
            absolutePath: selectionResult,
            fileName: path.basename(selectionResult),
            extension: AllowedScriptExtension.getMatchedExtension(
              selectionResult,
            ) as AllowedScriptExtension,
          };
        } else {
          highLighter.info('You have canceled to select config file');
          process.exit(0);
        }
    }
  }
  async afterEvaluate(value: ScriptPathValueType): Promise<void> {
    let scriptObject: any = {};
    try {
      switch (AllowedScriptExtension.getMatchedExtension(value.absolutePath)) {
        case AllowedScriptExtension.js:
        case AllowedScriptExtension.json:
        case AllowedScriptExtension.ts:
          if (
            AllowedScriptExtension.getMatchedExtension(value.absolutePath) ==
            AllowedScriptExtension.ts
          ) {
            const compiler = Optional.config.tsc
              ? new Compiler({
                  flags: [`--project ${Optional.config.tsc}`],
                } as any)
              : tsImport;
            scriptObject = await compiler.compile(value.absolutePath);
          } else scriptObject = require(value.absolutePath);
          if (typeof scriptObject != 'object') {
            throw new UnresolvedSyntaxError(
              `The format of ${value.fileName} is not an object.`,
            );
          }
          const rootKeys = Object.keys(scriptObject);
          if (rootKeys.length == 1 && rootKeys[0] == 'default')
            scriptObject = scriptObject.default;
          else if (rootKeys.length > 1 && rootKeys.includes('default'))
            throw new UnresolvedSyntaxError(
              `Your input script ${value.fileName} has both default and named module exports.`,
            );
          break;
        case AllowedScriptExtension.yaml:
        case AllowedScriptExtension.yml:
          scriptObject = yaml.parse(
            fs.readFileSync(value.absolutePath, 'utf-8'),
          );
          break;
      }
      const scriptParser = await ScriptParser.instance;
      scriptParser['setScriptObject'](scriptObject);
    } catch (error) {
      throw new UnresolvedSyntaxError(
        `Cannot parse ${value.fileName}, ${(error as any).message}`,
      );
    }
  }
}
