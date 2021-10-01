import { execSync } from 'child_process';
import chalk from 'chalk';
import { HighLighter } from '../../module';
export const setProcessEnv = async () => {
  const highLighter = await HighLighter.instance;
  if (!process.env.npm_config_argv && !process.env.npm_lifecycle_event) {
    try {
      execSync('yarn -v');
      process.env = {
        ...process.env,
        ...JSON.parse(
          execSync('yarn env').toString().split('\n').slice(1, -2).join(''),
        ),
      };
    } catch {
      process.env = {
        ...process.env,
        ...Object.fromEntries(
          execSync('npm run env')
            .toString()
            .split('\n')
            .filter((eachLine) => eachLine.includes('='))
            .map((eachLine) => {
              const spliterIndex = eachLine.indexOf('=');
              return [
                eachLine.slice(0, spliterIndex),
                eachLine.slice(spliterIndex + 1),
              ];
            }),
        ),
      };
    }
  }
  process
    .on('unhandledRejection', (reason) => {
      throw reason;
    })
    .on('uncaughtException', (error) => {
      if (error) highLighter.error(error);
      else process.exit(0);
      process.exit(1);
    });
};
