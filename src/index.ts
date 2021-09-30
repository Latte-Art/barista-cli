#!/usr/bin/env node
import { setProcessEnv, OptionParser } from './module';

(async () => {
  setProcessEnv();
  const optionParser = await OptionParser.instance;
  await optionParser.parseOptions();
  process.exit(0);
})();
