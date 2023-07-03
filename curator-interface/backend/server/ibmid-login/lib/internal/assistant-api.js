const BaseService = require("./base-service");
const axios = require("axios");
const { WATSON_ASSISTANT_VERSION } = require("../config/constants");

const AssistantV1 = require("ibm-watson/assistant/v1");
const { IamAuthenticator } = require("ibm-watson/auth");

class AssistantAPI extends BaseService {
  async listAssistants(credentials, cursor, fullResponse) {
    const assistant = new AssistantV1({
      version: WATSON_ASSISTANT_VERSION,
      authenticator: new IamAuthenticator({
        apikey: credentials.apikey,
      }),
      serviceUrl: credentials.url,
    });
    const response = await assistant.listWorkspaces({ cursor: cursor });
    fullResponse = fullResponse.concat(response.result.workspaces);

    if (response.result.pagination.next_cursor)
      return this.listAssistants(
        credentials,
        response.result.pagination.next_cursor,
        fullResponse
      );
    return fullResponse;
  }
  async listAssistantsV2(credentials, cursor, fullResponse) {
    return new Promise((resolve, reject) => {
      axios
        .get(
          `${credentials.url}/v2/assistants?version=2021-06-14?cursor=${cursor}`,
          {
            headers: { "Content-Type": "application/json" },
            auth: {
              username: "apikey",
              password: credentials.apikey,
            },
          }
        )
        .then((res) => {
          res.data.assistants.forEach(
            (assistant) => (assistant.actions = true)
          );
          fullResponse = fullResponse.concat(res.data.assistants);
          if (res.data.pagination.refresh_url)
            resolve(
              this.listAssistantsV2(
                credentials,
                res.data.pagination.refresh_url,
                fullResponse
              )
            );
          else resolve(fullResponse);
        })
        .catch((err) => {
          console.log(
            "ListAssistantsV2: Got error trying to list assistants... Maybe because instance is not Enterprise! Will continue with only the dialog (old) assistants."
          );
          resolve(fullResponse);
        });
    });
  }
  async getWorkspace(credentials, workspaceId) {
    const assistant = new AssistantV1({
      version: WATSON_ASSISTANT_VERSION,
      authenticator: new IamAuthenticator({
        apikey: credentials.apikey,
      }),
      serviceUrl: credentials.url,
    });
    const response = await assistant.getWorkspace({
      workspaceId,
      _export: true,
    });
    return response.result;
  }
}

AssistantAPI.default = new AssistantAPI();

module.exports = AssistantAPI;
