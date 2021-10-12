export const getTerminalWidth = (): number =>
  process.stdout.isTTY ? process.stdout.getWindowSize()[0] - 15 : 50;
