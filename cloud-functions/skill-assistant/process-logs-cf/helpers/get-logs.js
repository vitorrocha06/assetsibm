const { lastRecord } = require("../database/db2");
const { queryAssistant } = require("./assistant");

async function getLogs(conn, schema, assistantConfig) {
  const filter = (await lastRecord(conn, schema))["1"];
  return queryAssistant(
    assistantConfig,
    null,
    filter ? filter.replace(" ", "T").substring(0, 20) + "999Z" : null,
    []
  );
}

module.exports = {
  getLogs,
};
