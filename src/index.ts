#!/usr/bin/env node
import { setProcessEnv, OptionParser, CommandParser } from './module';

(async () => {
  await setProcessEnv();
  const optionParser = await OptionParser.instance;
  await optionParser.parseOptions();
  const commandParser = await CommandParser.instance;
  await commandParser.parseCommands();
  process.exit(0);
})();
