const pt = require("periodic-table");
const allElements = pt.all();
console.log(
  allElements.map((element) => ({
    symbol: element.symbol,
    name: element.name,
  }))
);
