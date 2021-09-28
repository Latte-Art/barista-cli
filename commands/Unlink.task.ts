import { runPromisifiedCommand } from './CommandShell.task';
const unlink = async () => {
  try {
    await runPromisifiedCommand('yarn unlink', false);
  } catch {}
  process.exit(0);
};
unlink();
