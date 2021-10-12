const { KoconutArray } = require('koconut');

module.exports = {
  a: (args) => {
    console.log(args);
    return 'echo a';
  },
  b: 'echo c',
  // d: KoconutArray.from([1, 2, 3, 4, 5]),
};
