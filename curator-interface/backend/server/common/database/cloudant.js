const { CloudantV1 } = require("@ibm-cloud/cloudant");
const { IamAuthenticator } = require("ibm-cloud-sdk-core");

function createCloudantClient(apiKey, url) {
  const authenticator = new IamAuthenticator({
    apikey: apiKey,
  });
  const client = CloudantV1.newInstance({
    authenticator: authenticator,
  });
  client.setServiceUrl(url);

  return client;
}

async function createDbAndDoc(client, docId, document, public) {
  return new Promise(async (resolve, reject) => {
    document._id = docId;
    try {
      const putDatabaseResult = (
        await client.putDatabase({
          db: public ? "public-dashboards" : "dashboards-v2",
        })
      ).result;
      if (putDatabaseResult.ok) {
        console.log(`Database created.`);
      }
    } catch (err) {
      if (err.code === 412) {
        console.log(
          `Cannot create database, it already exists. Will connect to existing Db...`
        );
      } else {
        reject(err);
      }
    }

    try {
      const createDocumentResponse = await client.postDocument({
        db: public ? "public-dashboards" : "dashboards-v2",
        document: document,
      });

      // Keep track with the revision number of the document object
      document._rev = createDocumentResponse.result.rev;
      resolve("Document created with success.");
    } catch (err) {
      if (err.code === 409) {
        console.log(
          `Cannot create document, as it already exists. Will try updating it instead...`
        );
        resolve(await updateDoc(client, docId, document, public));
      } else {
        reject(err);
      }
    }
  });
}

async function updateDoc(client, docId, document, public) {
  return new Promise(async (resolve, reject) => {
    // Try to get the document if it previously existed in the database
    try {
      const existingDocument = (
        await client.getDocument({
          docId: docId,
          db: public ? "public-dashboards" : "dashboards-v2",
        })
      ).result;

      document._rev = existingDocument._rev;
      document._id = docId;

      await client.postDocument({
        db: public ? "public-dashboards" : "dashboards-v2",
        document: document,
      });

      resolve("Document updated with success.");
    } catch (err) {
      if (err.code === 404) {
        reject(
          `Cannot update document because either database or document was not found.`
        );
      }
    }
  });
}

async function getDoc(client, docId, public) {
  return new Promise(async (resolve, reject) => {
    try {
      const getDocParams = {
        db: public ? "public-dashboards" : "dashboards-v2",
        docId: docId,
      };
      const response = await client.getDocument(getDocParams);
      const { result } = response;

      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}

async function deleteDoc(client, document, public) {
  return new Promise(async (resolve, reject) => {
    // Try to get the document if it previously existed in the database
    try {
      try {
        await client.deleteDocument({
          db: public ? "public-dashboards" : "dashboards-v2",
          docId: document.id,
          rev: document.doc._rev,
        });
      } catch (err) {
        const existingDocument = (
          await client.getDocument({
            docId: document.id,
            db: public ? "public-dashboards" : "dashboards-v2",
          })
        ).result;

        await client.deleteDocument({
          db: public ? "public-dashboards" : "dashboards-v2",
          docId: document.id,
          rev: existingDocument._rev,
        });
      }
      resolve("Document deleted with success.");
    } catch (err) {
      console.log(err);
    }
  });
}

async function getAllDocs(client) {
  try {
    const response = await client.postAllDocs({
      db: "public-dashboards",
      includeDocs: true,
    });
    return response.result;
  } catch (err) {
    console.log(err);
    return {
      total_rows: 0,
      offset: 0,
      rows: [],
    };
  }
}

module.exports = {
  createCloudantClient,
  createDbAndDoc,
  getDoc,
  deleteDoc,
  getAllDocs,
};
