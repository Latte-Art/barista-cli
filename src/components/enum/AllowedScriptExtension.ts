export enum AllowedScriptExtension {
  'json' = '.json',
  'yaml' = '.yaml',
  'yml' = '.yml',
  'js' = '.js',
  'ts' = '.ts',
}
const allowedScriptExtensionStringArray: Array<string> = Object.values(
  AllowedScriptExtension,
).map((eachExtension) => eachExtension.toString());
export namespace AllowedScriptExtension {
  export const checkIsAllowed = (fileName: string): boolean =>
    allowedScriptExtensionStringArray.some((eachExtensionString) =>
      fileName.endsWith(eachExtensionString),
    );
  export const checkIsDefaultFileName = (fileName: string): boolean =>
    allowedScriptExtensionStringArray.some(
      (eachExtensionString) => `barista${eachExtensionString}` == fileName,
    );
  export const list = allowedScriptExtensionStringArray;
}
