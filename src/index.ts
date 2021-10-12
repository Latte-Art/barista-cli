#!/usr/bin/env node
import {
  setProcessEnv,
  OptionParser,
  CommandParser,
  HighLighter,
} from './module';

(async () => {
  await setProcessEnv();
  console.log((await HighLighter.instance).inputCommand);
  const optionParser = await OptionParser.instance;
  await optionParser.parseOptions();
  const commandParser = await CommandParser.instance;
  await commandParser.parseCommands();
  await commandParser.executeCommands();
  process.exit(0);
})();
