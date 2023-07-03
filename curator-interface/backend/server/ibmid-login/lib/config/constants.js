const IAM_URL = "https://iam.cloud.ibm.com";
const ACCOUNTS_URL = "https://accounts.cloud.ibm.com";
const BILLING_URL = "https://billing.cloud.ibm.com";
const RESOURCE_CONTROLLER_URL = "https://resource-controller.cloud.ibm.com";
const GLOBAL_CATALOG_URL = "https://globalcatalog.cloud.ibm.com";
const GLOBAL_SEARCH_URL = "https://api.global-search-tagging.cloud.ibm.com";
const GLOBAL_TAGGING_URL = "https://tags.global-search-tagging.cloud.ibm.com";
const WATSON_DATA_URL = "https://api.dataplatform.cloud.ibm.com";

const WATSON_ASSISTANT_URL =
  "https://api.us-south.assistant.watson.cloud.ibm.com";

const WATSON_ASSISTANT_VERSION = "2021-06-14";

const IAM_OPENID_CONFIG_CACHE_TIMEOUT = 3600000;
const RESOURCE_SERVICE_CACHE_TIMEOUT = 30000;
const GLOBAL_CATALOG_API_CACHE_TIMEOUT = 3600000;

const IBMID_APIKEY_LOGIN_CACHE_TIMEOUT = 1200000;

const WATSON_ASSISTANT_RESOURCE_ID = "7045626d-55e3-4418-be11-683a26dbc1e5";
const DB2_RESOURCE_ID = "dashdb-for-transactions";
const COGNOS_RESOURCE_ID = "81cda9f0-b9c3-11e7-acad-0d931c5f18f1";
const CLOUDANT_RESOURCE_ID = "cloudant";
const NLU_RESOURCE_ID = "bb6393bc-7d81-446b-9728-61b704f6eca5";
const COS_RESOURCE_ID = "dff97f5c-bc5e-4455-b470-411c3edbe49c";

module.exports = {
  IAM_URL,
  ACCOUNTS_URL,
  BILLING_URL,
  RESOURCE_CONTROLLER_URL,
  GLOBAL_CATALOG_URL,
  GLOBAL_SEARCH_URL,
  GLOBAL_TAGGING_URL,
  WATSON_DATA_URL,
  WATSON_ASSISTANT_URL,
  WATSON_ASSISTANT_VERSION,
  RESOURCE_SERVICE_CACHE_TIMEOUT,
  GLOBAL_CATALOG_API_CACHE_TIMEOUT,
  IAM_OPENID_CONFIG_CACHE_TIMEOUT,

  IBMID_APIKEY_LOGIN_CACHE_TIMEOUT,

  WATSON_ASSISTANT_RESOURCE_ID,
  DB2_RESOURCE_ID,
  COGNOS_RESOURCE_ID,
  CLOUDANT_RESOURCE_ID,
  NLU_RESOURCE_ID,
  COS_RESOURCE_ID,
};
