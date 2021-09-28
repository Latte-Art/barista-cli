#!/usr/bin/env node
import { setProcessEnv } from './module';
(async () => {
  setProcessEnv();
  console.log('done');
  process.exit(0);
})();
