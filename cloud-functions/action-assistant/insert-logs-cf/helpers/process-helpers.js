const {
  connect,
  insert,
  endConnection,
  insertOnConversations,
  insertOnCalls,
} = require("../database/db2");
const { uploadItem } = require("../database/cos");
const {
  createCloudantClient,
  createDbAndDoc,
} = require("../database/cloudant");

function insertOnDb2(dbConfig, results) {
  return new Promise(async (resolve, reject) => {
    try {
      const { connStr, schema } = dbConfig;
      const primarySqlString = agregateSql(results.primaryObject);
      const secondarySqlString = agregateSql(results.secondaryObject);
      const tertiarySqlString = agregateSql(results.tertiaryObject);
      const quaternarySqlString = agregateSql(results.quaternaryObject);
      const quinarySqlString = agregateSql(results.path);
      const sixthSqlString = agregateSql(results.actionObject);

      const conn = await connect(connStr);
      Promise.all([
        insert(conn, schema, "LOGS", primarySqlString),
        insertOnConversations(conn, schema, secondarySqlString),
        insertOnCalls(conn, schema, tertiarySqlString),
        insert(conn, schema, "CONTEXTVARIABLES", quaternarySqlString),
        insert(conn, schema, "CONVERSATIONPATH", quinarySqlString),
        insert(conn, schema, "ACTIONS", sixthSqlString),
      ]).then(() => {
        resolve(console.log("Inserted on Db2"));
      });
    } catch (error) {
      reject(error);
    }
  });
}

function agregateSql(objects) {
  let sqlStrings = [];
  for (let object of objects) {
    sqlStrings.push(createSqlString(object));
  }
  return sqlStrings;
}

function createSqlString(params) {
  let values = [];
  let sql;

  if (Object.keys(params).length == 16) {
    console.log("first Table");
    sql = `'${params.idUser}','${params.conversationID}','${params.logID}','${params.clientMessage}',(TIMESTAMP(CAST('${params.clientTimestamp.date}' AS VARCHAR(10)),'${params.clientTimestamp.time}')),'${params.assistantMessage}',(TIMESTAMP(CAST('${params.assistantTimestamp.date}' AS VARCHAR(10)),'${params.assistantTimestamp.time}')),'${params.action}',${params.sentiment},'${params.firstIntent}',${params.firstIntentConfidence},'${params.intents}','${params.intentsConfidence}','${params.entities}','${params.error}',${params.score}`;
  } else if (Object.keys(params).length == 9) {
    console.log("second Table");
    sql = `'${params.idUser}','${params.conversationID}','${params.channel}',(TIMESTAMP(CAST('${params.startTime.date}' AS VARCHAR(10)),'${params.startTime.time}')),${params.interval},${params.feedback},${params.transfered},${params.relevance},${params.newUser}`;
  } else if (Object.keys(params).length == 7) {
    console.log("Third Table");
    sql = `'${params.idUser}','${params.conversationID}','${params.userNumber}','${params.vgwPhoneUserPhoneNumber}',${params.vgwIsDTMF},${params.vgwBargeInOccurred},${params.concluded}`;
  } else if (Object.keys(params).length == 6) {
    console.log("Sixth Table");
    sql = `'${params.conversationID}', '${params.action}', '${params.type}', '${params.reason}',(TIMESTAMP(CAST('${params.actionStartTime.date}' AS VARCHAR(10)),'${params.actionStartTime.time}')),'${params.event}'`;
  } else if (Object.keys(params).length == 3) {
    console.log("Fifth Table");
    sql = `'${params.conversationID}','${params.originNode}','${params.destineNode}'`;
  } else {
    console.log("fourth Table");
    sql = `'${params.conversationID}','${params.envVariableName}','${params.envVariableValue}','${params.envVariableType}'`;
  }
  values.push(sql);
  return `(${values.join(",")})`;
}

function insertOnCos(cosConfig, logs) {
  return new Promise(async (resolve, reject) => {
    try {
      var today = new Date();

      const itemName = `logs-${logs[0].workspace_id}-${String(
        today.getDate()
      ).padStart(2, "0")}/${today.getMonth() + 1}/${today.getFullYear()}.json`;
      await uploadItem(cosConfig, itemName, JSON.stringify(logs));
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

function insertOnCloudant(cloudantConfig, logs) {
  return new Promise(async (resolve, reject) => {
    try {
      const { apiKey, url, dbName } = cloudantConfig;
      const client = createCloudantClient(url, apiKey);
      for (let beginning = 0; beginning < logs.length; beginning += 100) {
        await createDbAndDoc(client, dbName, {
          logs: logs.slice(beginning, beginning + 100),
        });
      }
      resolve(console.log("Inserted on Cloudant!"));
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
}

module.exports = {
  insertOnCos,
  insertOnDb2,
  insertOnCloudant,
};
