const { createTables } = require("./helpers/handle-process");
async function main({
  dbConfig,
  assistantConfig,
  nluConfig,
  cosConfig,
  cloudantConfig,
}) {
  await createTables(dbConfig.connStr, dbConfig.schema, dbConfig.deadline);

  return {
    dbConfig,
    cosConfig,
    cloudantConfig,
    assistantConfig,
    nluConfig,
  };
}

module.exports = {
  main,
};
