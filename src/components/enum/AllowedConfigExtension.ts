export enum AllowedConfigExtension {
  'baristarc' = '.baristarc',
  'baristarc_json' = '.baristarc.json',
  'baristarc_yaml' = '.baristarc.yaml',
  'baristarc_yml' = '.baristarc.yml',
  'baristarc_js' = '.baristarc.js',
  'baristarc_ts' = '.baristarc.ts',
}
const allowedConfigExtensionStringArray = Object.values(
  AllowedConfigExtension,
).map((eachExtension) => eachExtension.toString());
export namespace AllowedConfigExtension {
  export const checkIsAllowed = (fileName: string): boolean =>
    allowedConfigExtensionStringArray.some((eachExtensionString) =>
      fileName.endsWith(eachExtensionString),
    );
  export const checkIsDefaultFileName = (fileName: string): boolean =>
    allowedConfigExtensionStringArray.some(
      (eachExtensionString) => eachExtensionString == fileName,
    );
}
