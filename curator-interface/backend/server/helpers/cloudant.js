const {
  createCloudantClient,
  createDbAndDoc,
  getDoc,
  getAllDocs,
  deleteDoc,
} = require("../common/database/cloudant");

async function insertOnCloudant(apikey, url, docId, document, public) {
  try {
    const client = createCloudantClient(apikey, url);
    return await createDbAndDoc(client, docId, document, public);
  } catch (err) {
    console.log(err);
    return { Error: "Unnable to connect with suplied credentials" };
  }
}

async function getFromCloudant(apiKey, url, docId, public) {
  try {
    const client = createCloudantClient(apiKey, url);
    return await getDoc(client, docId, public);
  } catch (err) {
    console.log(err);
    return { Error: "Unnable to connect with suplied credentials" };
  }
}

async function deleteFromCloudant(apiKey, url, document, public) {
  try {
    const client = createCloudantClient(apiKey, url);
    return await deleteDoc(client, document, public);
  } catch (err) {
    console.log(err);
  }
}

async function getAllFromCloudant(apiKey, url) {
  try {
    const client = createCloudantClient(apiKey, url);
    return await getAllDocs(client);
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  insertOnCloudant,
  getFromCloudant,
  deleteFromCloudant,
  getAllFromCloudant,
};
