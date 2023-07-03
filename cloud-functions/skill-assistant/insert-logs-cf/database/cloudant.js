const { CloudantV1 } = require("@ibm-cloud/cloudant");
const { IamAuthenticator } = require("ibm-cloud-sdk-core");

function createCloudantClient(cloudantURL, cloudantApiKey) {
  const authenticator = new IamAuthenticator({
    apikey: cloudantApiKey,
  });
  const client = CloudantV1.newInstance({
    authenticator: authenticator,
  });
  client.setServiceUrl(cloudantURL);

  return client;
}

async function createDbAndDoc(client, cloudantDbName, document) {
  return new Promise(async (resolve, reject) => {
    try {
      const putDatabaseResult = (
        await client.putDatabase({
          db: cloudantDbName,
        })
      ).result;
      if (putDatabaseResult.ok) {
        console.log(`"${cloudantDbName}" database created.`);
      }
    } catch (err) {
      if (err.code === 412) {
        console.log(
          `Cannot create "${cloudantDbName}" database, it already exists. Will connect to existing Db...`
        );
      } else {
        reject(err);
      }
    }

    try {
      const createDocumentResponse = await client.postDocument({
        db: cloudantDbName,
        document: document,
      });

      // Keep track with the revision number of the document object
      document._rev = createDocumentResponse.result.rev;
      resolve("Document created with success.");
      console.log(`${document._rev} document created!`);
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  createCloudantClient,
  createDbAndDoc,
};
