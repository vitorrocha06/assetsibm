const BaseService = require("./base-service");
const ibm = require("ibm-cos-sdk");

class CosAPI extends BaseService {
  listBuckets({ apikey, resource_instance_id, region }) {
    return new Promise((resolve, reject) => {
      const config = {
        endpoint: `https://s3.${
          region === "global" ? "us-south" : region
        }.objectstorage.softlayer.net`,
        apiKeyId: apikey,
        serviceInstanceId: resource_instance_id,
      };
      const cos = new ibm.S3(config);
      cos.listBuckets((err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }
}

CosAPI.default = new CosAPI();

module.exports = CosAPI;
