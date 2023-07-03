const { encrypt, decrypt } = require("../../../security/encrypt");
const {
  connect,
  insert,
  update,
  select,
  endConnection,
} = require("../../../common/database/db2");
const { createTrigger } = require("../../../helpers/cloudFunctions");

function getResourcesWithId(resources, resourceId, accountName) {
  const filteredResources = resources.filter(
    (resource) => resource.resource_id === resourceId
  );
  filteredResources.forEach((resource) => (resource.accountName = accountName));
  return filteredResources;
}

function encryptObject(obj) {
  Object.keys(obj).forEach((k) => {
    if (typeof obj[k] === "string") obj[k] = encrypt(obj[k]);
    else encryptObject(obj[k]);
  });
}

function decryptObject(obj) {
  Object.keys(obj)
    .filter(
      (key) => key != "WORKSPACE_ID" && key != "DRIVER" && key != "XSD_MODULE"
    )
    .forEach((k) => {
      if (typeof obj[k] === "string") {
        obj[k] = decrypt(obj[k]);
      } else decryptObject(obj[k]);
    });
}

function generateConnectionString(credential) {
  const credentials = credential.connection.db2;
  credentials.connStr = `DATABASE=${credentials.database};HOSTNAME=${credentials.hosts[0].hostname};PORT=${credentials.hosts[0].port};PROTOCOL=TCPIP;UID=${credentials.authentication.username};PWD=${credentials.authentication.password};SECURITY=SSL;`;
}

async function getWorkspaceCredentials(workspaceId, conn) {
  const db2 = await select(
    conn,
    "db2_credentials",
    `workspace_id='${workspaceId}'`
  );
  const cloudant = await select(
    conn,
    "cloudant_credentials",
    `workspace_id='${workspaceId}'`
  );
  const cognos = await select(
    conn,
    "cognos_credentials",
    `workspace_id='${workspaceId}'`
  );

  decryptObject(db2);
  decryptObject(cloudant);
  decryptObject(cognos);

  return {
    db2: db2[0],
    cloudant: cloudant[0],
    cognos: cognos[0],
  };
}

async function registerSkill(
  workspaceId,
  skillName,
  assistantGuid,
  assistantId,
  environmentId,
  accountId,
  resourcesKeys,
  triggerParams
) {
  const conn = await connect(process.env.DB2_CONN_STR);

  await insert(
    conn,
    "workspaces",
    `'${workspaceId}','${skillName}','${assistantGuid}',${
      assistantId ? `'${assistantId}'` : null
    },${environmentId ? `'${environmentId}'` : null},'${accountId}'`
  );
  await insert(
    conn,
    "cloudant_credentials",
    `'${resourcesKeys.cloudant.apikey}','${resourcesKeys.cloudant.url}','${workspaceId}'`
  );
  await insert(
    conn,
    "db2_credentials (CONNECTION_STRING,JDBC_URL,USERNAME,PASSWORD,WORKSPACE_ID)",
    `'${resourcesKeys.db2.connection.db2.connStr}','${resourcesKeys.db2.connection.db2.jdbc_url[0]}','${resourcesKeys.db2.connection.db2.authentication.username}','${resourcesKeys.db2.connection.db2.authentication.password}','${workspaceId}'`
  );
  await insert(
    conn,
    "cognos_credentials",
    `'${resourcesKeys.cognos.client_id}','${resourcesKeys.cognos.client_secret}','${workspaceId}'`
  );
  endConnection(conn);
  await createTrigger(triggerParams);
}

async function updateSkill(workspaceId, resourcesKeys) {
  const conn = await connect(process.env.DB2_CONN_STR);
  await update(
    conn,
    "cloudant_credentials",
    `apikey='${resourcesKeys.cloudant.apikey}', url='${resourcesKeys.cloudant.url}'`,
    `workspace_id='${workspaceId}'`
  );
  await update(
    conn,
    "db2_credentials",
    `connection_string='${resourcesKeys.db2.connection.connStr}', jdbc_url='${resourcesKeys.db2.connection.jdbc_url[0]}', username='${resourcesKeys.db2.authentication.username}', password='${resourcesKeys.db2.authentication.password}'`,
    `workspace_id='${workspaceId}'`
  );
  await update(
    conn,
    "cognos_credentials",
    `client_id='${resourcesKeys.cognos.client_id}', client_secret='${resourcesKeys.cognos.client_secret}'`,
    `workspace_id='${workspaceId}'`
  );
  endConnection(conn);
  await createTrigger(triggerParams);
}

async function getAvailableWorkspaces(accounts) {
  const conn = await connect(process.env.DB2_CONN_STR);
  const accountIds = accounts.map((acc) => `'${acc.metadata.guid}'`).join(", ");
  const workspaces = await select(
    conn,
    "workspaces",
    `account_id in (${accountIds})`
  );

  for (let i in workspaces) {
    const workspaceCredentials = await getWorkspaceCredentials(
      workspaces[i].WORKSPACE_ID,
      conn
    );
    workspaces[i] = { ...workspaces[i], ...workspaceCredentials };
  }
  endConnection(conn);
  return workspaces;
}

module.exports = {
  getResourcesWithId,
  encryptObject,
  decryptObject,
  generateConnectionString,
  registerSkill,
  updateSkill,
  getAvailableWorkspaces,
};
