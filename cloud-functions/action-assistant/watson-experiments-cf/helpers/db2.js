const {
  connect,
  createTable,
  insert,
  endConnection,
} = require("../common/database/db2");

function createTables(connStr, schema) {
  console.log("Creating Tables!");
  const sqlTables = {
    overviewTable: {
      creation: `CREATE TABLE IF NOT EXISTS ${schema}.OVERVIEW (metric VARCHAR(1000) NOT NULL, value DECIMAL(17,16) NOT NULL,PRIMARY KEY(metric));`,
      refreshing: `DELETE FROM ${schema}.OVERVIEW;`,
    },
    classDistributionTable: {
      creation: `CREATE TABLE IF NOT EXISTS ${schema}.CLASSDISTRIBUTION (intent VARCHAR(1000) NOT NULL, count INTEGER NOT NULL, PRIMARY KEY(intent));`,
      refreshing: `DELETE FROM ${schema}.CLASSDISTRIBUTION;`,
    },
    precisionAtKTable: {
      creation: `CREATE TABLE IF NOT EXISTS ${schema}.PRECISIONATK (k INTEGER NOT NULL, precision DECIMAL(17,16) NOT NULL, PRIMARY KEY(k));`,
      refreshing: `DELETE FROM ${schema}.PRECISIONATK;`,
    },
    classAccuracyTable: {
      creation: `CREATE TABLE IF NOT EXISTS ${schema}.CLASSACCURACY (class VARCHAR(1000) NOT NULL, count integer NOT NULL, precision DECIMAL(17,16) NOT NULL, recall DECIMAL(17,16) NOT NULL, f1 DECIMAL(17,16) NOT NULL, PRIMARY KEY(class));`,
      refreshing: `DELETE FROM ${schema}.CLASSACCURACY;`,
    },
    pairWiseClassErrorsTable: {
      creation: `CREATE TABLE IF NOT EXISTS ${schema}.PAIRWISECLASSERRORS (trueClass VARCHAR(1000) NOT NULL, predictedClass VARCHAR(1000) NOT NULL, confidence DECIMAL(17,16) NOT NULL, input VARCHAR(1000) NOT NULL);`,
      refreshing: `DELETE FROM ${schema}.PAIRWISECLASSERRORS;`,
    },
    accuracyVsCoverageTable: {
      creation: `CREATE TABLE IF NOT EXISTS ${schema}.ACCURACYVSCOVERAGE (confidenceThreshold DECIMAL(17,16) NOT NULL, accuracy DECIMAL(17,16) NOT NULL, coverage DECIMAL(17,16) NOT NULL);`,
      refreshing: `DELETE FROM ${schema}.ACCURACYVSCOVERAGE;`,
    },
  };

  return new Promise(async (resolve, reject) => {
    try {
      const conn = await connect(connStr);
      await Promise.all([
        createTable(conn, sqlTables.overviewTable),
        createTable(conn, sqlTables.classDistributionTable),
        createTable(conn, sqlTables.precisionAtKTable),
        createTable(conn, sqlTables.classAccuracyTable),
        createTable(conn, sqlTables.pairWiseClassErrorsTable),
        createTable(conn, sqlTables.accuracyVsCoverageTable),
      ]).then(() => {
        endConnection(conn);
        resolve({ result: "success" });
      });
    } catch (error) {
      reject(error);
    }
  });
}

function insertOnDb2(connStr, schema, insertValues) {
  return new Promise(async (resolve, reject) => {
    try {
      const conn = await connect(connStr);
      await Promise.all([
        insert(conn, "OVERVIEW", schema, insertValues["OVERVIEW"]),
        insert(
          conn,
          "CLASSDISTRIBUTION",
          schema,
          insertValues["CLASSDISTRIBUTION"]
        ),
        insert(conn, "PRECISIONATK", schema, insertValues["PRECISIONATK"]),
        insert(conn, "CLASSACCURACY", schema, insertValues["CLASSACCURACY"]),
        insert(
          conn,
          "PAIRWISECLASSERRORS",
          schema,
          insertValues["PAIRWISECLASSERRORS"]
        ),
        insert(
          conn,
          "ACCURACYVSCOVERAGE",
          schema,
          insertValues["ACCURACYVSCOVERAGE"]
        ),
      ]).then(() => {
        endConnection(conn);
        resolve("success");
      });
    } catch (error) {
      console.log(error);
      reject("failure");
    }
  });
}

function returnSqlStrings(output) {
  const newPairwise_class_errors = [];
  const returnObj = {};

  for (let obj of output.reports.pairwise_class_errors) {
    for (let error of obj.errors) {
      newPairwise_class_errors.push({
        true_class: obj.true_class,
        predicted_class: error.predicted_class,
        confidence: error.confidence,
        input: error.input ? error.input.replace(/[\?\!']*/g, "") : "",
      });
    }
  }

  returnObj.OVERVIEW = agregateSql(output.reports.overview);
  returnObj.CLASSDISTRIBUTION = agregateSql(output.reports.class_distribution);
  returnObj.PRECISIONATK = agregateSql(output.reports.precision_at_k);
  returnObj.CLASSACCURACY = agregateSql(output.reports.class_accuracy);
  returnObj.PAIRWISECLASSERRORS = agregateSql(newPairwise_class_errors);
  returnObj.ACCURACYVSCOVERAGE = agregateSql(
    output.reports.accuracy_vs_coverage
  );

  return returnObj;
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
  Object.entries(params).map(([key, value]) => {
    if (key.includes("Time"))
      values.push(
        `(TIMESTAMP(CAST('${value.date}' AS VARCHAR(10)),'${value.time}'))`
      );
    else values.push(`'${value}'`);
  });
  return `(${values.join(",")})`;
}

module.exports = {
  createTables,
  insertOnDb2,
  returnSqlStrings,
};
