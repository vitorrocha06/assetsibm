const {
  getConversations,
  updateConversation,
  refreshExperimentTables,
} = require("../helpers/db2");

async function getLogs(req, res) {
  const { connStr, schema, lastDate, date, intent } = req.body;

  console.log(schema);

  const result = await getConversations({
    connStr: connStr,
    schema: schema,
    // schema: "CURATOR",
    // connStr: process.env.DB2_CONN_STR,
    // schema: process.env.DB2_SCHEMA,
    lastDate: lastDate,
    date: date,
    intent: intent,
  });

  result
    ? res.send({
        intents: result.intents,
      })
    : res.send(null);
}

async function updateScore(req, res) {
  const { conversation, connStr, schema } = req.body;

  console.log(schema);

  await updateConversation(
    conversation,
    connStr,
    schema
    // process.env.DB2_CONN_STR,
    // process.env.DB2_SCHEMA
    // "CURATOR"
  );
  res.send({ result: "Conversation Updated" });
}

async function refreshExperimentController(req, res) {
  const { connStr, schema } = req.body;
  res.send(await refreshExperimentTables(connStr, schema));
}

module.exports = {
  getLogs,
  updateScore,
  refreshExperimentController,
};
