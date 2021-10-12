import { OriginalClass } from './OriginalClass';

interface SomeInterface {
  someMethod(): void;
}

declare module './OriginalClass' {
  interface OriginalClass extends SomeInterface {}
}
OriginalClass.prototype.someMethod = function () {
  console.log('methodB');
};
