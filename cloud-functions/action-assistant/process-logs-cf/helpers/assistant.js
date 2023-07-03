const AssistantV2 = require("ibm-watson/assistant/v2");
const { IamAuthenticator } = require("ibm-watson/auth");

async function queryAssistant(
  assistantConfig,
  cursor,
  lastRecord,
  fullResponse
) {
  const assistant = new AssistantV2({
    version: "2021-06-14",
    authenticator: new IamAuthenticator({
      apikey: assistantConfig.apiKey,
    }),
    serviceUrl: assistantConfig.serviceUrl,
  });

  let filter = lastRecord ? `response_timestamp>=${lastRecord}` : "";

  const params = {
    assistantId: assistantConfig.assistantID,
    filter,
    cursor,
    sort: "request_timestamp",
  };

  const response = await assistant.listLogs(params);
  fullResponse = fullResponse.concat(response.result.logs);
  if (response.result.pagination.next_cursor) {
    return await queryAssistant(
      assistantConfig,
      response.result.pagination.next_cursor,
      null,
      fullResponse
    );
  } else {
    return fullResponse;
  }
}

module.exports = { queryAssistant };
