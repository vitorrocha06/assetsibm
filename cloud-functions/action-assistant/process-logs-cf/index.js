const { processLogs } = require("./helpers/handle-process");

async function main({
  dbConfig,
  cosConfig,
  cloudantConfig,
  assistantConfig,
  nluConfig,
}) {
  console.log("processLogs");
  const { connStr, schema } = dbConfig;
  const results = await processLogs(connStr, schema, assistantConfig);

  return {
    dbConfig,
    cosConfig,
    cloudantConfig,
    nluConfig,
    assistantConfig,
    results,
  };
}

module.exports = {
  main,
};
