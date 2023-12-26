const data = require("./src/assets/soil-moisture-data.json");

const reducedData = data.filter((_, i) => i % 10 === 0);

console.log(reducedData.length, data.length);

// saving reduced data to a json file

const fs = require("fs");
fs.writeFileSync("src/assets/soil-moisture-data-reduced.json", JSON.stringify(reducedData));
