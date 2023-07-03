const { execSync, exec } = require("child_process");
const { IBMidService } = require("../ibmid-login/lib/ibmid-service");
const path = require("path");

async function createTrigger(params) {
  const { db2, assistant, nlu, cos, cloudant } = params.credentials;

  const assistantConfig = {
    apiKey: assistant.apikey,
    version: "2021-06-14",
    serviceUrl: assistant.url,
    skillID: params.workspaceId,
    assistantID: params.assistantId,
    transferNode: params.assistantMetadata.transferNode,
    feedbackNode: params.assistantMetadata.feedbackNode,
    relevantTopics: params.assistantMetadata.relevantTopics,
    finalNode: params.assistantMetadata.finalNode,
  };

  const nluConfig = {
    language: "pt",
    version: "2021-08-01",
    apikey: nlu.apikey,
    serviceUrl: nlu.url,
  };

  const cosConfig = {
    endpoint: `s3.${process.env.REGION}.cloud-object-storage.appdomain.cloud`,
    apiKeyId: cos.apikey,
    serviceInstanceId: cos.resource_instance_id,
    bucketName: params.cosBucket,
  };

  const cloudantConfig = {
    apiKey: cloudant.apikey,
    url: cloudant.url,
    dbName: `${params.skill_name.toLowerCase().replace(/ /g, "")}-logs`,
  };

  const db2Config = {
    connStr: `DATABASE=${db2.connection.db2.database};HOSTNAME=${db2.connection.db2.hosts[0].hostname};PORT=${db2.connection.db2.hosts[0].port};PROTOCL=TCPIP;UID=${db2.connection.db2.authentication.username};PWD=${db2.connection.db2.authentication.password};Security=SSL;`,
    schema: params.skill_name.replace(/[\- \/\\]/g, ""),
  };

  process.env["DB_CONFIG"] = JSON.stringify(db2Config);
  process.env["ASSISTANT_CONFIG"] = JSON.stringify(assistantConfig);
  process.env["NLU_CONFIG"] = JSON.stringify(nluConfig);
  process.env["COS_CONFIG"] = JSON.stringify(cosConfig);
  process.env["CLOUDANT_CONFIG"] = JSON.stringify(cloudantConfig);
  process.env["PERIODICITY"] = params.periodicity;
  process.env["TRIGGER_NAME"] = `${params.skill_name.replace(
    /[ \/\\]/g,
    ""
  )}-assistant-curator-trigger`;
  process.env["RULE_NAME"] = `${params.skill_name.replace(
    /[ \/\\]/g,
    ""
  )}-assistant-curator-rule`;

  params.actions
    ? executeScript("triggerActions")
    : executeScript("triggerSkills");
}

async function runExperiment(params) {
  const assistantCreds = {
    apiKey: params.apikey,
    url: params.url,
    workspaceID: params.workspaceId,
    skillJSON: params.skillJSON,
  };
  const db2Creds = {
    connStr: params.connStr,
    schema: params.schema,
  };
  process.env["ASSISTANTCREDS"] = JSON.stringify(assistantCreds);
  process.env["DB2CREDS"] = JSON.stringify(db2Creds);

  return params.actions
    ? executeScript("experimentsFunctionAction")
    : executeScript("experimentsFunctionSkills");
}

function executeScript(name) {
  return new Promise((resolve, reject) => {
    try {
      const ls = exec(path.join(__dirname, `'../scripts/${name}.sh'`));
      ls.stdout.on("data", (data) => {
        console.log("stdout: " + data.toString());
      });

      ls.stderr.on("data", (data) => {
        console.log("stderr: " + data.toString());
      });

      ls.on("exit", (code) => {
        console.log("child process exited with code " + code.toString());
        resolve("Finished");
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
}

module.exports = {
  createTrigger,
  runExperiment,
};
