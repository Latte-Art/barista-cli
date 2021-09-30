import fs from 'fs';
import path from 'path';
export const getRootDir = () => {
  let currentDir = process.cwd();
  while (!fs.readdirSync(currentDir).includes('package.json')) {
    const parentDir = path.dirname(currentDir);
    if (parentDir == currentDir)
      throw new Error(`Couldn't find a package.json file in ${process.cwd()}`);
    currentDir = path.dirname(currentDir);
  }
  return currentDir;
};
