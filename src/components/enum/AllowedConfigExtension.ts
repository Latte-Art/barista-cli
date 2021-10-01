export enum AllowedConfigExtension {
  'baristarc' = '.baristarc',
  'baristarc_json' = '.baristarc.json',
  'baristarc_yaml' = '.baristarc.yaml',
  'baristarc_yml' = '.baristarc.yml',
  'baristarc_js' = '.baristarc.js',
  'baristarc_ts' = '.baristarc.ts',
}
const allowedConfigExtensionArray = Object.values(
  AllowedConfigExtension,
) as Array<AllowedConfigExtension>;
const allowedConfigExtensionStringArray: Array<string> =
  allowedConfigExtensionArray.map((eachExtension) => eachExtension.toString());
export namespace AllowedConfigExtension {
  export const checkIsAllowed = (fileName: string): boolean =>
    allowedConfigExtensionStringArray.some((eachExtensionString) =>
      fileName.endsWith(eachExtensionString),
    );
  export const checkIsDefaultFileName = (fileName: string): boolean =>
    allowedConfigExtensionStringArray.some(
      (eachExtensionString) => eachExtensionString == fileName,
    );
  export const getMatchedExtension = (
    fileName: string,
  ): AllowedConfigExtension | undefined =>
    allowedConfigExtensionArray.find((eachExtension: AllowedConfigExtension) =>
      fileName.endsWith(eachExtension),
    );

  export const list = allowedConfigExtensionStringArray;
}
