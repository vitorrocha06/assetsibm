var ibmdb = require("ibm_db");

function connect(connStr) {
  return new Promise((resolve, reject) => {
    ibmdb.open(connStr, function (err, conn) {
      if (err) reject(err);
      resolve(conn);
    });
  });
}

function endConnection(conn) {
  conn.close(function () {
    console.log("Connection closed.");
  });
}

function createLogsTable(conn, schema) {
  return new Promise((resolve, reject) => {
    var sql = `CREATE TABLE IF NOT EXISTS ${schema}.LOGS (idUser VARCHAR(1000)NOT NULL, conversationID VARCHAR(1000) NOT NULL,logID VARCHAR(1000) NOT NULL, clientMessage CLOB(2147483647),clientTimeStamp timestamp,assistantMessage CLOB(2147483647),assistantTimeStamp timestamp,nodeTitle VARCHAR(1000), sentiment FLOAT(10),firstIntent VARCHAR(1000),firstIntentConfidence FLOAT(10),intents VARCHAR(10000),intentsConfidence VARCHAR(10000),entities VARCHAR(1000),error VARCHAR(10000),score INTEGER default null,PRIMARY KEY(logID));`;
    try {
      conn.query(sql, (err) => {
        if (err) {
          if (err.sqlcode === 4136 || err.sqlcode === -601) {
            return resolve("Table already existent!");
          }
          throw err;
        }
        return resolve("Table created!");
      });
    } catch (error) {
      reject(error);
    }
  });
}

function createConversationsTable(conn, schema) {
  return new Promise((resolve, reject) => {
    var sql = `CREATE TABLE IF NOT EXISTS ${schema}.CONVERSATIONS (iduser VARCHAR(1000) NOT NULL,conversationID VARCHAR(1000) NOT NULL,channel VARCHAR(1000),starttime timestamp,timeInterval INTEGER NOT NULL, feedback SMALLINT, transfered BOOLEAN, relevance BOOLEAN,newuser BOOLEAN NOT NULL,PRIMARY KEY(conversationID));`;
    try {
      conn.query(sql, (err) => {
        if (err) {
          if (err.sqlcode === 4136 || err.sqlcode === -601) {
            return resolve("Table already existent!");
          }
          throw err;
        }
        return resolve("Table created!");
      });
    } catch (error) {
      reject(error);
    }
  });
}

function createCallsTable(conn, schema) {
  return new Promise((resolve, reject) => {
    var sql = `CREATE TABLE IF NOT EXISTS ${schema}.CALLS (iduser VARCHAR(1000) NOT NULL,conversationID VARCHAR(1000) NOT NULL,userNumber VARCHAR(1000),userIPAddress VARCHAR(1000),vgwIsDTMF BOOLEAN,vgwBargeInOccurred BOOLEAN,vgwPhoneUserPhoneNumber VARCHAR(1000),vgwDTMFCollectionSucceeded BOOLEAN, concluded BOOLEAN,PRIMARY KEY(conversationID));`;
    try {
      conn.query(sql, (err) => {
        if (err) {
          if (err.sqlcode === 4136 || err.sqlcode === -601) {
            return resolve("Table already existent!");
          }
          throw err;
        }
        return resolve("Table created!");
      });
    } catch (error) {
      reject(error);
    }
  });
}

function createContextVariablesTable(conn, schema) {
  return new Promise((resolve, reject) => {
    var sql = `CREATE TABLE IF NOT EXISTS ${schema}.CONTEXTVARIABLES (conversationID VARCHAR(1000) NOT NULL,envVariableName VARCHAR(1000) NOT NULL,envVariableValue VARCHAR(1000),envVariableType VARCHAR(1000));`;
    try {
      conn.query(sql, (err) => {
        if (err) {
          if (err.sqlcode === 4136 || err.sqlcode === -601) {
            return resolve("Table already existent!");
          }
          throw err;
        }
        return resolve("Table created!");
      });
    } catch (error) {
      reject(error);
    }
  });
}

function createConversationPathTable(conn, schema) {
  return new Promise((resolve, reject) => {
    var sql = `CREATE TABLE IF NOT EXISTS ${schema}.CONVERSATIONPATH (conversationID VARCHAR(1000) NOT NULL, originNode VARCHAR(1000), destineNode VARCHAR(1000));`;
    try {
      conn.query(sql, (err) => {
        if (err) {
          if (err.sqlcode === 4136 || err.sqlcode === -601) {
            return resolve("Table already existent!");
          }
          throw err;
        }
        return resolve("Table created!");
      });
    } catch (error) {
      reject(error);
    }
  });
}

function deleteIfOlderThan(conn, schema, date) {
  return new Promise((resolve, reject) => {
    const sql = `DELETE from ${schema}.LOGS WHERE CLIENTTIMESTAMP < '${date}';`;
    conn.query(sql, (err) => {
      if (err) {
        console.log(err);
      }
      resolve("Older lines deleted!");
    });
  });
}

module.exports = {
  connect,
  createLogsTable,
  createConversationsTable,
  createCallsTable,
  createContextVariablesTable,
  createConversationPathTable,
  deleteIfOlderThan,
  endConnection,
};
