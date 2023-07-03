const {
  selectLogs,
  updateLogs,
  connect,
  endConnection,
  refreshTables,
} = require("../common/database/db2");
const axios = require("axios");

function getConversations({ connStr, schema, lastDate, date, intent }) {
  console.log(intent);
  console.log(date);
  console.log(lastDate);

  return new Promise(async (resolve, reject) => {
    try {
      const conn = await connect(connStr);
      const rows = await selectLogs(
        conn,
        schema,
        date
          ? `SCORE is null ${
              intent ? `and FIRSTINTENT like '%${intent}%'` : ""
            } and CLIENTTIMESTAMP between '${date} 00:00:00.00' and '${date} 23:59:59.99' ORDER BY CLIENTTIMESTAMP DESC FETCH FIRST 100 ROWS ONLY`
          : lastDate
          ? `SCORE is null ${
              intent ? `and FIRSTINTENT like '%${intent}%'` : ""
            } and CLIENTTIMESTAMP < '${lastDate}' ORDER BY CLIENTTIMESTAMP DESC FETCH FIRST 100 ROWS ONLY`
          : `SCORE is null ${
              intent ? `and FIRSTINTENT like '%${intent}%'` : ""
            } ORDER BY CLIENTTIMESTAMP DESC FETCH FIRST 100 ROWS ONLY`
      );

      if (rows.legnth === 0) {
        resolve(null);
      } else {
        const intents = arrangeConversations(rows);
        endConnection(conn);
        resolve({
          intents: intents,
        });
      }
    } catch (err) {
      console.log(err);
      resolve(null);
    }
  });
}

function arrangeConversations(rows) {
  let arrangedConversations = {};
  for (let row of rows) {
    if (arrangedConversations[row.FIRSTINTENT])
      arrangedConversations[row.FIRSTINTENT].push(row);
    else arrangedConversations[row.FIRSTINTENT] = [row];
  }
  return arrangedConversations;
}

async function updateConversation(conversations, connStr, schema) {
  return new Promise(async (resolve, reject) => {
    try {
      const conn = await connect(connStr);
      for (let conversation of Object.keys(conversations)) {
        for (let log of conversations[conversation]) {
          if (log.SCORE !== null)
            await updateLogs(
              conn,
              schema,
              `score = ${log.SCORE}`,
              `logId = '${log.LOGID}'`
            );
        }
      }

      endConnection(conn);
      resolve("Conversation updated");
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
}

async function refreshExperimentTables(connStr, schema) {
  const conn = await connect(connStr);
  return await refreshTables(conn, schema);
}

module.exports = {
  getConversations,
  updateConversation,
  arrangeConversations,
  refreshExperimentTables,
};
