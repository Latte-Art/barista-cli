export enum AllowedScriptExtension {
  'json' = '.json',
  'yaml' = '.yaml',
  'yml' = '.yml',
  'js' = '.js',
  'ts' = '.ts',
}
const allowedScriptExtensionStringArray = Object.values(
  AllowedScriptExtension,
).map((eachExtension) => eachExtension.toString());
export namespace AllowedScriptExtension {
  export const checkIsAllowed = (fileName: string): boolean =>
    allowedScriptExtensionStringArray.some((eachExtensionString) =>
      fileName.endsWith(eachExtensionString),
    );
}
