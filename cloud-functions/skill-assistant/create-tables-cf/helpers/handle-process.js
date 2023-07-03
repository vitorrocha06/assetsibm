const {
  connect,
  createLogsTable,
  deleteIfOlderThan,
  createConversationsTable,
  createCallsTable,
  createContextVariablesTable,
  createConversationPathTable,
  endConnection,
} = require("../database/db2");

function createTables(connStr, schema, deadline) {
  return new Promise(async (resolve, reject) => {
    try {
      const conn = await connect(connStr);
      let deadlineDate;
      if (deadline) {
        deadlineDate = generateDate(deadline);
        console.log(deadlineDate);
        await deleteIfOlderThan(conn, schema, deadlineDate);
      }
      await Promise.all([
        createLogsTable(conn, schema),
        createConversationsTable(conn, schema),
        createCallsTable(conn, schema),
        createContextVariablesTable(conn, schema),
        createConversationPathTable(conn, schema),
      ]).then(endConnection(conn));

      resolve({ result: "success" });
    } catch (error) {
      reject(error);
    }
  });
}

function generateDate(deadline) {
  var d = new Date();
  d.setDate(d.getDate() - deadline);
  const formatedDate = d.toISOString().toString().split("T")[0];
  return formatedDate;
}

module.exports = {
  createTables,
};
