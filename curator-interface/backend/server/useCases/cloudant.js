const {
  insertOnCloudant,
  getFromCloudant,
  deleteFromCloudant,
  getAllFromCloudant,
} = require("../helpers/cloudant");

async function insertOnCloudantController(req, res) {
  const { apikey, url, public, docId, document } = req.body;

  res.send(
    await insertOnCloudant(
      apikey ?? process.env.CLOUDANT_API_KEY,
      url ?? process.env.CLOUDANT_URL,
      docId,
      document,
      public
    )
  );
}

async function getFromCloudantController(req, res) {
  const { apikey, url, public, docId } = req.body;

  res.send(
    await getFromCloudant(
      apikey ?? process.env.CLOUDANT_API_KEY,
      url ?? process.env.CLOUDANT_URL,
      docId,
      public
    )
  );
}

async function deleteFromCloudantController(req, res) {
  const { apikey, url, document, public } = req.body;

  console.log(document);

  res.send(
    await deleteFromCloudant(
      apikey ?? process.env.CLOUDANT_API_KEY,
      url ?? process.env.CLOUDANT_URL,
      document,
      public
    )
  );
}

async function getAllFromCloudantController(req, res) {
  const { apikey, url } = req.body;
  res.send(
    await getAllFromCloudant(
      apikey ?? process.env.CLOUDANT_API_KEY,
      url ?? process.env.CLOUDANT_URL
    )
  );
}

module.exports = {
  insertOnCloudantController,
  getFromCloudantController,
  deleteFromCloudantController,
  getAllFromCloudantController,
};
