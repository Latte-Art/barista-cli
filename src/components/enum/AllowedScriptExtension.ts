export enum AllowedScriptExtension {
  'json' = '.json',
  'yaml' = '.yaml',
  'yml' = '.yml',
  'js' = '.js',
  'ts' = '.ts',
}
const allowedScriptExtensionArray = Object.values(
  AllowedScriptExtension,
) as Array<AllowedScriptExtension>;
const allowedScriptExtensionStringArray: Array<string> =
  allowedScriptExtensionArray.map((eachExtension) => eachExtension.toString());
export namespace AllowedScriptExtension {
  export const checkIsAllowed = (fileName: string): boolean =>
    allowedScriptExtensionStringArray.some((eachExtensionString) =>
      fileName.endsWith(eachExtensionString),
    );
  export const checkIsDefaultFileName = (fileName: string): boolean =>
    allowedScriptExtensionStringArray.some(
      (eachExtensionString) => `.barista${eachExtensionString}` == fileName,
    );
  export const getMatchedExtension = (
    fileName: string,
  ): AllowedScriptExtension | undefined =>
    allowedScriptExtensionArray.find((eachExtension: AllowedScriptExtension) =>
      fileName.endsWith(eachExtension),
    );
  export const list = allowedScriptExtensionStringArray;
}
