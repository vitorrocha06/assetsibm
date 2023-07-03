const { findSentimentScore } = require("./helpers/handle-process.js");
const { handleActions } = require("./helpers/handleActions.js");
const { contextVariablesTable } = require("./helpers/handleContext.js");

async function main({
  dbConfig,
  cosConfig,
  cloudantConfig,
  nluConfig,
  results,
}) {
  console.log("enrich");
  // await findSentimentScore(
  //   results.primaryObject,
  //   nluConfig.language,
  //   nluConfig.version,
  //   nluConfig.apikey,
  //   nluConfig.serviceUrl
  // );

  const contextVariables = contextVariablesTable(results.logs);
  results.quaternaryObject = contextVariables;

  results.actionObject = handleActions(results.logs);

  return {
    dbConfig,
    cosConfig,
    cloudantConfig,
    results,
  };
}

module.exports = {
  main,
};
