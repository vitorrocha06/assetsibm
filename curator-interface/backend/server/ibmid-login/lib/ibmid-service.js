const axios = require("axios");
const AuthenticatedService = require("./internal/authenticated-service");
const IAMAPI = require("./internal/iam-api");
const AccountsAPI = require("./internal/accounts-api");
const CosAPI = require("./internal/cos-api");
const AssistantAPI = require("./internal/assistant-api");
const GlobalCatalogAPI = require("./internal/global-catalog-api");
const ResourceControllerAPI = require("./internal/resource-controller-api");
const { notLoggedInResponse } = require("./responses");
const {
  getResourcesWithId,
  encryptObject,
  generateConnectionString,
  registerSkill,
  updateSkill,
  getAvailableWorkspaces,
} = require("./internal/helpers");
const getExpressAdapter = require("./adapters/express");
const constants = require("./config/constants");
const memoizee = require("memoizee");
const { runExperiment } = require("../../helpers/cloudFunctions");

class IBMidService extends AuthenticatedService {
  constructor(
    options,
    sendRequest = axios,
    iamApi = IAMAPI.default,
    accountsApi = AccountsAPI.default,
    assistantApi = AssistantAPI.default,
    cosApi = CosAPI.default,
    globalCatalogApi = GlobalCatalogAPI.default,
    resourceControllerApi = ResourceControllerAPI.default
  ) {
    super(sendRequest, iamApi);
    this.options = { ...constants, ...options };
    this.accountsApi = accountsApi;
    this.assistantApi = assistantApi;
    this.cosApi = cosApi;
    this.globalCatalogApi = globalCatalogApi;
    this.resourceControllerApi = resourceControllerApi;
    this.getPasscode = this.getPasscode.bind(this);
    this.login = this.login.bind(this);
    this.memoizedLogin = memoizee(this.login.bind(this), {
      maxAge: this.options.IBMID_APIKEY_LOGIN_CACHE_TIMEOUT,
      normalizer: (args) => JSON.stringify(args),
    });
    this.logout = this.logout.bind(this);
    this.switchAccount = this.authenticatedFunction(
      this.switchAccount.bind(this)
    );
    this.getOwnUser = this.authenticatedFunction(this.getOwnUser.bind(this));
    this.listAccounts = this.authenticatedFunction(
      this.listAccounts.bind(this)
    );

    if (this.options.IBMID_APIKEY) {
      this.proxy = this.withTokenOverride(this.proxy.bind(this));
      this.listResources = this.withTokenOverride(
        this.listResources.bind(this)
      );
      this.manageResource = this.withTokenOverride(
        this.manageResource.bind(this)
      );
    }

    this.proxy = this.authenticatedFunction(this.proxy.bind(this));
    this.listResources = this.authenticatedFunction(
      this.listResources.bind(this)
    );
    this.manageResource = this.authenticatedFunction(
      this.manageResource.bind(this)
    );
    this.listCuratorResources = this.authenticatedFunction(
      this.listCuratorResources.bind(this)
    );
    this.listCuratorAssistants = this.authenticatedFunction(
      this.listCuratorAssistants.bind(this)
    );
    this.getCuratorResourcesKeys = this.authenticatedFunction(
      this.getCuratorResourcesKeys.bind(this)
    );
    this.manageCuratorWorkspace = this.authenticatedFunction(
      this.manageCuratorWorkspace.bind(this)
    );
    this.getCuratorWorkspaces = this.authenticatedFunction(
      this.getCuratorWorkspaces.bind(this)
    );
    this.runCuratorExperiment = this.authenticatedFunction(
      this.runCuratorExperiment.bind(this)
    );
    this.getCuratorWorkspace = this.authenticatedFunction(
      this.getCuratorWorkspace.bind(this)
    );
    this.listCuratorBuckets = this.authenticatedFunction(
      this.listCuratorBuckets.bind(this)
    );

    this.expressAdapter = getExpressAdapter(this);
  }

  async getPasscode() {
    return this.iamApi.getOpenIDConfig().then((data) => ({
      headers: { location: data.passcode_endpoint },
      statusCode: 302,
      body: {},
    }));
  }

  async login({ apikey, passcode }) {
    let data = await this.iamApi.createIAMToken({ apikey, passcode });
    if (!data.success) return { statusCode: 401, body: data };
    if (apikey)
      return {
        statusCode: 200,
        body: data,
        headers: this.getAuthCookies({
          token: data.token,
          refreshToken: data.refresh_token,
          expiresIn: data.expires_in,
        }),
      };
    let userData = await this.getOwnUser({
      token: data.token,
      skipAccountValidation: true,
    });
    if (userData.statusCode >= 400) return notLoggedInResponse();
    let accountData = await this.listAccounts({ token: data.token });
    if (accountData.body.resources.length === 0) return notLoggedInResponse();
    let account_id, refreshData;
    for (let account of accountData.body.resources) {
      if (refreshData && refreshData.success) continue;
      account_id = account.metadata.guid;
      refreshData = await this.iamApi.createIAMToken({
        refreshToken: data.refresh_token,
        accountID: account_id,
      });
    }
    let headers = this.getAuthCookies({
      token: refreshData.token,
      refreshToken: refreshData.refresh_token,
      accountID: account_id,
      expiresIn: refreshData.expires_in,
    });
    return { statusCode: 200, body: refreshData, headers };
  }

  async logout() {
    let headers = this.getAuthCookies({});
    return { statusCode: 200, body: { success: true }, headers };
  }

  async switchAccount({ refreshToken, accountID }) {
    if (
      accountID &&
      this.options.ALLOWED_ACCOUNTS &&
      !this.options.ALLOWED_ACCOUNTS.includes(accountID)
    )
      return notLoggedInResponse();
    let refreshTokenResponse = await this.refreshToken({
      refreshToken,
      accountID,
    });
    return { statusCode: 200, ...refreshTokenResponse };
  }

  async getOwnUser({ token, skipAccountValidation }) {
    return this.iamApi
      .validateToken({ token })
      .then((user) => {
        if (
          !skipAccountValidation &&
          this.options.ALLOWED_ACCOUNTS &&
          !this.options.ALLOWED_ACCOUNTS.includes(user.account.bss)
        )
          throw new Error("Account is not allowed");
        if (
          this.options.ALLOWED_USERS &&
          !this.options.ALLOWED_USERS.reduce(
            (acc, allowed) => acc || user.email.match(allowed),
            false
          )
        )
          throw new Error("User is not allowed");
        return { statusCode: 200, body: user };
      })
      .catch(() => notLoggedInResponse());
  }

  async listAccounts({ token }) {
    return this.accountsApi
      .listAccounts({ token })
      .then((response) => ({
        ...response.data,
        resources: response.data.resources.filter(
          (acc) =>
            !this.options.ALLOWED_ACCOUNTS ||
            this.options.ALLOWED_ACCOUNTS.includes(acc.metadata.guid)
        ),
      }))
      .then((data) => ({ statusCode: 200, body: data }))
      .catch((err) => ({
        statusCode: err.response.status,
        body: err.response.data,
      }));
  }

  async listResources({ token, resourceType }) {
    let resourceID = null;
    if (resourceType) {
      let catalogListData = await this.globalCatalogApi.listCatalogEntries({
        resourceType,
      });
      let catalogEntry = catalogListData.resources
        .reduce(
          (acc, r) => (r.children ? [...acc, ...r.children] : acc),
          catalogListData.resources
        )
        .find((r) => r.kind === "service" && r.name === resourceType);
      if (!catalogEntry)
        return { statusCode: 404, body: { message: "Resource not found" } };
      resourceID = catalogEntry.id;
    }

    let resourceListData = await this.resourceControllerApi.listAllResources({
      token,
      resourceID,
    });
    return {
      statusCode: 200,
      body: resourceListData,
    };
  }

  async listCuratorResources({ account, refreshToken }) {
    const parsedAccount = JSON.parse(account);
    const res = {
      assistant: [],
      db2: [],
      cognos: [],
      cloudant: [],
      nlu: [],
      cos: [],
    };
    let accToken = await this.switchAccount({
      refreshToken,
      accountID: parsedAccount.metadata.guid,
    });
    if (accToken.body.success) {
      const resources = await this.listResources({
        token: accToken.body.token,
      });
      res.assistant = res.assistant.concat(
        getResourcesWithId(
          resources.body.resources,
          this.options.WATSON_ASSISTANT_RESOURCE_ID,
          parsedAccount.entity.name
        )
      );
      res.db2 = res.db2.concat(
        getResourcesWithId(
          resources.body.resources,
          this.options.DB2_RESOURCE_ID,
          parsedAccount.entity.name
        )
      );
      res.cognos = res.cognos.concat(
        getResourcesWithId(
          resources.body.resources,
          this.options.COGNOS_RESOURCE_ID,
          parsedAccount.entity.name
        )
      );
      res.cloudant = res.cloudant.concat(
        getResourcesWithId(
          resources.body.resources,
          this.options.CLOUDANT_RESOURCE_ID,
          parsedAccount.entity.name
        )
      );
      res.nlu = res.nlu.concat(
        getResourcesWithId(
          resources.body.resources,
          this.options.NLU_RESOURCE_ID,
          parsedAccount.entity.name
        )
      );
      res.cos = res.cos.concat(
        getResourcesWithId(
          resources.body.resources,
          this.options.COS_RESOURCE_ID,
          parsedAccount.entity.name
        )
      );
    }

    return {
      statusCode: 200,
      body: res,
    };
  }

  async listCuratorAssistants({ token, resourceID }) {
    const response = await this.manageResource({
      token,
      resourceID,
      url: "/resource_keys",
      method: "get",
      data: null,
    });

    let credentials;
    if (response.body.resources[0]?.credentials)
      credentials = response.body.resources[0]?.credentials;
    else {
      console.log("Creating new credentials...");
      const { data } = await this.manageResourceKey({
        token,
        data: {
          name: `service-credentials-${(Math.random() + 1)
            .toString(36)
            .substring(5)}`,
          source: resourceID,
        },
      });
      credentials = data.credentials;
    }

    let data = await this.assistantApi.listAssistants(credentials, null, []);
    data = await this.assistantApi.listAssistantsV2(credentials, null, data);

    return { statusCode: 200, body: data };
  }

  async listCuratorBuckets({ token, region, id }) {
    const response = await this.manageResource({
      token,
      resourceID: id,
      url: "/resource_keys",
      method: "get",
      data: null,
    });

    let credentials;
    if (response.body.resources[0]?.credentials)
      credentials = response.body.resources[0]?.credentials;
    else {
      const { data } = await this.manageResourceKey({
        token,
        data: {
          name: `service-credentials-${(Math.random() + 1)
            .toString(36)
            .substring(5)}`,
          source: id,
        },
      });
      credentials = data.credentials;
    }

    console.log(
      `Will try to acces COS with credential ${credentials.iam_apikey_name}`
    );

    const data = await this.cosApi.listBuckets({
      apikey: credentials.apikey,
      resource_instance_id: id,
      region,
    });

    return { statusCode: 200, body: data };
  }

  async getCuratorWorkspace({ token, workspaceId, resourceID }) {
    const response = await this.manageResource({
      token,
      resourceID,
      url: "/resource_keys",
      method: "get",
      data: null,
    });

    let credentials;
    if (response.body.resources[0]?.credentials)
      credentials = response.body.resources[0]?.credentials;
    else {
      const { data } = await this.manageResourceKey({
        token,
        data: {
          name: `service-credentials-${(Math.random() + 1)
            .toString(36)
            .substring(5)}`,
          source: resourceId,
        },
      });
      credentials = data.credentials;
    }

    const assistantDetails = await this.assistantApi.getWorkspace(
      credentials,
      workspaceId
    );
    const { dialog_nodes, intents, entities } = assistantDetails;

    return { statusCode: 200, body: { dialog_nodes, intents, entities } };
  }

  async getCuratorResourcesKeys({ token, resources }) {
    const res = {
      assistant: {},
      db2: {},
      cognos: {},
      cloudant: {},
      nlu: {},
      cos: {},
    };
    for (let key of Object.keys(res)) {
      const response = await this.manageResource({
        token,
        resourceID: resources[key],
        url: "/resource_keys",
        method: "get",
        data: null,
      });

      console.log(key, "Okay");

      if (response.body.resources[0]?.credentials)
        res[key] = response.body.resources[0]?.credentials;
      else {
        const { data } = await this.manageResourceKey({
          token,
          data: {
            name: `service-credentials-${(Math.random() + 1)
              .toString(36)
              .substring(5)}`,
            source: resources[key],
          },
        });
        res[key] = data.credentials;
      }
    }
    return {
      statusCode: 200,
      body: res,
    };
  }

  async manageCuratorWorkspace({ token, resources, metadata }) {
    const resourcesKeys = await this.getCuratorResourcesKeys({
      token,
      resources,
    });
    const triggerParams = {
      credentials: JSON.parse(JSON.stringify(resourcesKeys.body)),
      periodicity: metadata.periodicity,
      skill_name: metadata.skill_name,
      workspaceId: metadata.workspaceId,
      assistantId: metadata.environmentId,
      actions: metadata.actions,
      cosBucket: resources.cosBucket,
      assistantMetadata: resources.assistantMetadata,
    };
    generateConnectionString(resourcesKeys.body.db2);
    encryptObject(resourcesKeys.body);
    metadata.accountId
      ? await registerSkill(
          metadata.workspaceId,
          metadata.skill_name,
          metadata.assistantGuid,
          metadata.assistantId ?? null,
          metadata.environmentId ?? null,
          metadata.accountId,
          resourcesKeys.body,
          triggerParams
        )
      : await updateSkill(
          metadata.workspaceId,
          resourcesKeys.body,
          triggerParams
        );
    return {
      statusCode: 200,
      body: { success: true },
    };
  }

  async getCuratorWorkspaces({ token }) {
    const accounts = await this.listAccounts({ token });

    const workspaces = await getAvailableWorkspaces(accounts.body.resources);
    return {
      statusCode: 200,
      body: workspaces,
    };
  }

  async runCuratorExperiment({ token, resources }) {
    const response = await this.manageResource({
      token,
      resourceID: resources.assistantGuid,
      url: "/resource_keys",
      method: "get",
      data: null,
    });

    let credentials;
    if (response.body.resources[0]?.credentials)
      credentials = response.body.resources[0]?.credentials;
    else {
      const { data } = await this.manageResourceKey({
        token,
        data: {
          name: `service-credentials-${(Math.random() + 1)
            .toString(36)
            .substring(5)}`,
          source: resources.assistantGuid,
        },
      });
      credentials = data.credentials;
    }

    return await runExperiment({
      apikey: credentials.apikey,
      url: credentials.url,
      workspaceId: resources.workspaceId,
      skillJSON: resources.skillJSON,
      connStr: resources.connStr,
      schema: resources.schema,
      actions: resources.actions,
    });
  }

  async manageResource({ token, resourceID, url, method, data }) {
    return this.resourceControllerApi.manageResource({
      token,
      resourceID,
      url,
      method,
      data,
    });
  }

  async manageResourceKey({ token, data }) {
    return this.resourceControllerApi.createResourceKey({ token, data });
  }

  proxyRequest(targetURL) {
    let self = this;
    return function ({ token, url, method, headers, params, data }) {
      let iamOptions = { url, method, headers, params, data };
      delete iamOptions.headers.host;
      iamOptions.headers.authorization = `Bearer ${token}`;
      if (url.includes("daas")) delete iamOptions.headers;
      iamOptions.url = `${targetURL}${url}`;
      return self
        .sendRequest(iamOptions)
        .then((response) => ({
          statusCode: response.status,
          body: response.data,
          headers: response.headers,
        }))
        .catch((err) => ({
          statusCode: err.response.status,
          body: err.response.data,
          headers: err.response.headers,
        }));
    };
  }

  async getProxyURL({ token, resourceID, url, headers }) {
    if (resourceID.includes("whisk.system"))
      return `https://${
        resourceID.match(/(.*)functions:(.*):a/)[2]
      }.functions.cloud.ibm.com/api/v1/namespaces/${
        decodeURIComponent(resourceID).match(/(.*):(.*)::/)[2]
      }`;
    if (resourceID == "watson_data")
      return "https://api.dataplatform.cloud.ibm.com";
    let resourceResponse = await this.manageResource({
      token,
      resourceID,
      url: "",
      method: "GET",
    });
    if (
      resourceResponse.statusCode >= 400 ||
      resourceResponse.body.status_code >= 400
    )
      return;
    let resource = resourceResponse.body;
    if (resource.resource_id === "functions")
      return `https://${resource.region_id}.functions.cloud.ibm.com/api/v1/${
        url.startsWith("/web/") ? "web" : "namespaces"
      }/${resource.guid.match(/(.*):(.*)::/)[2]}${
        url.startsWith("/web/") ? url.replace("/web", "") : ""
      }`;
    if (resource.id.includes("conversation"))
      return `https://api.${resource.region_id}.assistant.watson.cloud.ibm.com/instances/${resource.guid}`;
    if (resource.id.includes("speech-to-text"))
      return `https://api.${resource.region_id}.speech-to-text.watson.cloud.ibm.com/instances/${resource.guid}`;
    let keys = await this.manageResource({
      token,
      resourceID,
      url: "/resource_keys",
      method: "GET",
    }).then((response) => response.body);
    let managerCreds = keys.resources.find(
      (key) => key.role && key.role.includes("Manager")
    );
    let editorCreds = keys.resources.find(
      (key) => key.role && key.role.includes("Writer")
    );
    let readerCreds = keys.resources.find(
      (key) => key.role && key.role.includes("Reader")
    );
    let bestCreds = managerCreds || editorCreds || readerCreds || {};
    let credentials = bestCreds.credentials || {};
    if (credentials.url) return credentials.url;
    if (credentials.api_endpoint_url)
      return credentials.api_endpoint_url
        .replace(
          "https://",
          `https://${credentials.client_id}:${credentials.client_secret}@`
        )
        .replace("/daas/", "");
    if (credentials.endpoints) {
      if (url === "/endpoints")
        return credentials.endpoints.replace("/endpoints", "");
      if (headers["x-endpoint-id"]) {
        let endpoints = await this.sendRequest({
          url: credentials.endpoints,
        }).then((response) => response.data);
        let endpointPath = headers["x-endpoint-id"].split(":");
        return (
          "https://" +
          endpointPath.reduce((endpoint, step) => endpoint[step], endpoints)
        );
      }
    }
  }

  async proxy({ token, resourceID, url, method, headers = {}, params, data }) {
    let proxyURL = await this.getProxyURL({ token, resourceID, url, headers });
    if (!proxyURL)
      return { statusCode: 404, body: { message: "Resource not found" } };
    return this.proxyRequest(proxyURL)({
      token,
      url,
      method,
      headers,
      params,
      data,
    });
  }

  withTokenOverride(func) {
    return async (options) => {
      let loginResponse = await this.memoizedLogin({
        apikey: this.options.IBMID_APIKEY,
      });
      if (loginResponse.statusCode >= 400) return func(options);
      return func({ ...options, token: loginResponse.body.token });
    };
  }
}

IBMidService.default = new IBMidService();

module.exports = IBMidService;
