const { sendLogsToDatabases } = require("./helpers/handle-process");

async function main({ dbConfig, cosConfig, cloudantConfig, results }) {
  console.log("insert");
  return sendLogsToDatabases(dbConfig, cosConfig, cloudantConfig, results);
  // return "ok";
}

module.exports = {
  main,
};
