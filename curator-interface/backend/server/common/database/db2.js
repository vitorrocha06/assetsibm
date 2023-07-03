process.env.DB2CODEPAGE = process.env.DB2CODEPAGE || 1208;
var ibmdb = require("ibm_db");

// uncomment this to create base db2 tables
createTables();

function connect(connStr) {
  return new Promise((resolve, reject) => {
    ibmdb.open(connStr.replace(/\"/g, ""), function (err, conn) {
      if (err) {
        console.log(err);
        reject(err);
      }
      resolve(conn);
    });
  });
}

function endConnection(conn) {
  return new Promise((resolve, reject) => {
    try {
      conn.close(function () {
        resolve("Db2 connection closed.");
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function createTables() {
  var sql = `create table curator.workspaces (
    workspace_id varchar(500) not null primary key,
    skill_name varchar(500) not null,
    assistant_guid varchar(500) not null,
    assistant_id varchar(500),
    environment_id varchar(500),
    account_id varchar(500) not null
    );
    create table curator.cloudant_credentials (
    apikey varchar(500)  not null,
    url varchar(500)  not null,
    workspace_id varchar(500) not null primary key
    );
    create table curator.db2_credentials (
    connection_string varchar(500) not null, 
    jdbc_url varchar(500) not null,
    username varchar(500) not null,
    password varchar(500) not null,
    workspace_id varchar(500) not null primary key,
    driver varchar(500) NOT NULL WITH DEFAULT 'com.ibm.db2.jcc.DB2Driver',
    xsd_module varchar(500) NOT NULL WITH DEFAULT 'https://ibm.com/daas/module/1.0/module.xsd'
    );
    create table curator.cognos_credentials (
    client_id varchar(500)  not null,
    client_secret varchar(500) not null,
    workspace_id varchar(500) not null  primary key
    );`;
  try {
    const conn = await connect(process.env.DB2_CONN_STR);

    conn.query(sql, (err) => {
      if (err) {
        if (err.sqlcode === 4136 || err.sqlcode === -601) {
          console.log("Tables already existent!");
        } else {
          throw err;
        }
      } else console.log("Tables created!");
    });
  } catch (error) {
    return error;
  }
}

function updateLogs(conn, schema, newValue, clause) {
  return new Promise((resolve, reject) => {
    try {
      const sql = `update ${schema}.LOGS set ${newValue} where ${clause}`;
      conn.querySync(sql);
      resolve("Updated rows");
    } catch (error) {
      reject(error);
    }
  });
}

function update(conn, table, newValue, clause) {
  return new Promise((resolve, reject) => {
    try {
      const sql = `update CURATOR.${table} set ${newValue} where ${clause}`;
      conn.querySync(sql);
      resolve("Updated rows");
    } catch (error) {
      reject(error);
    }
  });
}

function selectLogs(conn, schema, clause) {
  console.log(clause);

  return new Promise(async (resolve, reject) => {
    var sql = `SELECT * FROM ${schema}.LOGS WHERE ${clause};`;
    try {
      const rows = conn.querySync(sql);
      resolve(Array.from(rows));
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
}

function select(conn, table, clause) {
  return new Promise(async (resolve, reject) => {
    var sql = `SELECT * FROM CURATOR.${table} WHERE ${clause};`;
    try {
      const rows = conn.querySync(sql);
      resolve(Array.from(rows));
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
}

function insert(conn, table, values) {
  return new Promise(async (resolve, reject) => {
    var sql = `INSERT INTO CURATOR.${table} VALUES (${values});`;
    try {
      const rows = conn.querySync(sql);
      resolve(Array.from(rows));
    } catch (error) {
      reject(error);
    }
  });
}

function refreshTables(conn, schema) {
  return new Promise((resolve, reject) => {
    try {
      conn.query(
        `
      DELETE FROM ${schema}.OVERVIEW;
      DELETE FROM ${schema}.CLASSDISTRIBUTION;
      DELETE FROM ${schema}.PRECISIONATK;
      DELETE FROM ${schema}.CLASSACCURACY;
      DELETE FROM ${schema}.PAIRWISECLASSERRORS;
      DELETE FROM ${schema}.ACCURACYVSCOVERAGE;
      `,
        (newErr) => {
          if (newErr && (newErr?.sqlcode != 513 || newErr?.sqlcode != -204)) {
            console.log("ERRO 154", newErr);
          }
          resolve("Tables refreshed! Starting from 0.");
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  connect,
  endConnection,
  updateLogs,
  update,
  selectLogs,
  select,
  insert,
  refreshTables,
};
