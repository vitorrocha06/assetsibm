// require("dotenv").config({ path: "../../.env" });
require("dotenv").config({});

const { sleep } = require("./misc");

const AssistantV1 = require("ibm-watson/assistant/v1");
const { IamAuthenticator } = require("ibm-watson/auth");

const groupBy = require("group-by");

function createAssistantClient(apiKey, url) {
  return new AssistantV1({
    authenticator: new IamAuthenticator({
      apikey: apiKey,
    }),
    serviceUrl: url,
    version: "2018-02-16",
  });
}

async function getIntentsAndExamples(client, id, allIntents, cursor) {
  try {
    const response = await client.listIntents({
      workspaceId: id,
      _export: true,
      cursor: cursor ? cursor : null,
    });

    allIntents = allIntents.concat(response.result.intents);

    if (response.result.pagination.next_cursor) {
      return getIntentsAndExamples(
        client,
        id,
        allIntents,
        response.result.pagination.next_cursor
      );
    } else {
      return allIntents;
    }
  } catch (err) {
    console.log(err);
  }
}

async function createAssistant(client, intents) {
  try {
    const response = await client.createWorkspace(dataToWorkspace(intents));
    return response.result.workspace_id;
  } catch (err) {
    console.log(err);
  }
}

function dataToWorkspace(train) {
  let grouped = groupBy(train, "class");
  return {
    name: "experiments-assistant",
    intents: Object.keys(grouped).map((key) => ({
      intent: key,
      examples: grouped[key].map((e) => e.input),
    })),
  };
}

async function waitForAssistantsAvailability(client, assistants) {
  while (
    assistants.some(
      (assistant) => assistant.status.toLowerCase() != "available"
    )
  ) {
    const results = await Promise.allSettled(
      assistants
        .map((assistant) => {
          if (assistant.status.toLowerCase() != "available")
            return checkIfAvailable(client, assistant.skillID);
        })
        .filter((promise) => promise)
    );

    results.forEach((assistantDetails) => {
      console.log(
        `MODEL ${assistantDetails.value.workspace_id} STATUS: ${assistantDetails.value.status}`
      );
      assistants[
        assistants.findIndex(
          (assistant) =>
            assistant.skillID === assistantDetails.value.workspace_id
        )
      ].status = assistantDetails.value.status;
    });
    console.log("");

    if (
      assistants.some(
        (assistant) => assistant.status.toLowerCase() != "available"
      )
    )
      await sleep(5000);
  }
}

async function checkIfAvailable(client, id) {
  try {
    const response = await client.getWorkspace({ workspaceId: id });
    return response.result;
  } catch (err) {
    console.log(err);
  }
}

async function messageAssistant(client, id, text) {
  let context = await client
    .message({ input: {}, workspaceId: id })
    .then((response) => response.result.context)
    .catch(console.log);

  const messageParams = {
    workspaceId: id,
    input: { text: text },
    alternateIntents: true,
    context,
  };

  const assistantResponse = await client.message(messageParams);

  return assistantResponse.result.intents.map((intent) => ({
    class: intent.intent,
    confidence: intent.confidence,
  }));
}

async function deleteAssistants(client, allAssistants, cursor) {
  const response = await client.listWorkspaces({
    cursor: cursor ? cursor : null,
  });

  allAssistants = allAssistants.concat(response.result.workspaces);

  if (response.result.pagination.next_cursor) {
    return deleteAssistants(
      client,
      allAssistants,
      response.result.pagination.next_cursor
    );
  } else {
    allAssistants.map(async (assistant) => {
      if (assistant.name === "experiments-assistant") {
        await deleteAssistant(client, assistant.workspace_id);
      }
    });
  }
}

async function deleteAssistant(client, id) {
  const response = await client.deleteWorkspace({ workspaceId: id });
  if (response.status == 200) {
    console.log(`ASSISTANT ${id} DELETED!`);
  } else {
    console.log(`ERROR DELETING ASSISTANT ${id}!`);
  }
}

module.exports = {
  createAssistantClient,
  getIntentsAndExamples,
  createAssistant,
  waitForAssistantsAvailability,
  messageAssistant,
  deleteAssistants,
};
