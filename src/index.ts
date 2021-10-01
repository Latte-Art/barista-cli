#!/usr/bin/env node
import { setProcessEnv, OptionParser } from './module';

(async () => {
  await setProcessEnv();
  const optionParser = await OptionParser.instance;
  await optionParser.parseOptions();
  process.exit(0);
})();
