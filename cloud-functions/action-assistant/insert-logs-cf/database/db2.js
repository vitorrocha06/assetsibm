process.env.DB2CODEPAGE = process.env.DB2CODEPAGE || 1208;
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
    console.log("Db2 connection closed.");
  });
}

function insert(conn, schema, table, sqlString) {
  return new Promise((resolve, reject) => {
    if (sqlString.length === 0) return resolve("Nothing to insert!");
    var sql = `INSERT INTO ${schema}.${table} VALUES ${sqlString};`;

    try {
      conn.query(sql, function (err) {
        if (err) throw err;
        else {
          return resolve("Inserted!");
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function insertOnConversations(conn, schema, sqlString) {
  if (sqlString.length === 0) return "Nothing to insert!";
  for (let insertion of sqlString) {
    var sql = `MERGE
      INTO ${schema}.CONVERSATIONS
      USING(
      VALUES${insertion}) AS SOURCE(IDUSER,CONVERSATIONID,CHANNEL,STARTTIME,TIMEINTERVAL,FEEDBACK,TRANSFERED,RELEVANCE,NEWUSER)
      ON ${schema}.CONVERSATIONS.CONVERSATIONID= SOURCE.CONVERSATIONID
      WHEN MATCHED THEN
      UPDATE SET 
      TIMEINTERVAL = TIMEINTERVAL + SOURCE.TIMEINTERVAL,
      FEEDBACK = CASE WHEN FEEDBACK = 0 THEN SOURCE.FEEDBACK ELSE FEEDBACK END,
      TRANSFERED = CASE WHEN TRANSFERED = false THEN SOURCE.TRANSFERED ELSE TRANSFERED END,
      RELEVANCE = CASE WHEN RELEVANCE = false THEN SOURCE.RELEVANCE ELSE RELEVANCE END
      WHEN NOT MATCHED THEN
      INSERT
      VALUES (SOURCE.IDUSER,SOURCE.CONVERSATIONID,SOURCE.CHANNEL,SOURCE.STARTTIME,SOURCE.TIMEINTERVAL,SOURCE.FEEDBACK,SOURCE.TRANSFERED,SOURCE.RELEVANCE,SOURCE.NEWUSER);`;

    await conn.query(sql, function (err) {
      if (err) {
        console.log(err);
        reject(err);
      }
    });
  }
  return "Inserted!";
}

async function insertOnCalls(conn, schema, sqlString) {
  if (sqlString.length === 0) return "Nothing to insert!";
  for (let insertion of sqlString) {
    var sql = `MERGE
      INTO  ${schema}.CALLS
      USING(
      VALUES${insertion}) AS SOURCE(iduser,conversationID,userNumber,userIPAddress,vgwIsDTMF,vgwBargeInOccurred,vgwPhoneUserPhoneNumber,vgwDTMFCollectionSucceeded,concluded)
      ON  ${schema}.CALLS.CONVERSATIONID = SOURCE.CONVERSATIONID
      WHEN MATCHED THEN
      UPDATE SET 
      VGWISDTMF = CASE WHEN VGWISDTMF = false THEN SOURCE.VGWISDTMF ELSE VGWISDTMF END,
      VGWBARGEINOCCURRED = CASE WHEN VGWBARGEINOCCURRED = false THEN SOURCE.VGWBARGEINOCCURRED ELSE VGWBARGEINOCCURRED END,
      VGWDTMFCOLLECTIONSUCCEEDED = CASE WHEN VGWDTMFCOLLECTIONSUCCEEDED = false THEN SOURCE.VGWDTMFCOLLECTIONSUCCEEDED ELSE VGWDTMFCOLLECTIONSUCCEEDED END,
      CONCLUDED = CASE WHEN CONCLUDED = false THEN SOURCE.CONCLUDED ELSE CONCLUDED END
      WHEN NOT MATCHED THEN
      INSERT
      VALUES (SOURCE.iduser,SOURCE.conversationID,SOURCE.userNumber,SOURCE.userIPAddress,SOURCE.vgwIsDTMF,SOURCE.vgwBargeInOccurred,SOURCE.vgwPhoneUserPhoneNumber,SOURCE.vgwDTMFCollectionSucceeded,SOURCE.concluded);`;

    await conn.query(sql, function (err) {
      if (err) {
        console.log(err);
        return err;
      }
    });
  }
  return "Inserted!";
}

module.exports = {
  connect,
  insert,
  insertOnConversations,
  insertOnCalls,
  endConnection,
};
