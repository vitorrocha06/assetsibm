function handleLogs(logs) {
  return logs.map((log) => {
    return handleLog(log);
  });
}

function handleLog(log) {
  const intents = findIntents(log);
  const confidence = intentsConfidence(log);
  const actionVisited = findActionsVisited(log);

  return {
    idUser: log.request.context.metadata?.user_id
      ? log.request.context.metadata.user_id
      : "",
    conversationID: log.request.context.conversation_id,
    logID: log.log_id,
    clientMessage: log.request.input?.text
      ? log.request.input.text.replace("'", "")
      : "",
    clientTimestamp: adjustTimestamp(log.request_timestamp),
    assistantMessage: findText(log),
    assistantTimestamp: adjustTimestamp(log.response_timestamp),
    action:
      actionVisited.length > 0
        ? actionVisited[0]
          ? actionVisited[0]
          : ""
        : "",
    sentiment: 0,
    firstIntent: intents.length > 0 ? intents[0] : "",
    firstIntentConfidence:
      confidence.length > 0 ? parseFloat(confidence[0]) : 0,
    intents: intents.join(","),
    intentsConfidence: confidence.join(","),
    entities: findEntities(log),
    error: "",
    score: "NULL",
  };
}

function adjustTimestamp(timestamp) {
  const Timestamp = timestamp.split("T");

  const date = Timestamp[0].split("-").reverse().join(".");
  const time = Timestamp[1].split(".")[[0]];

  return { date: date, time: time };
}

function findText(log) {
  return log.response.output.text
    .map((text) => {
      return text.replace("'", "");
    })
    .join(" , ");
}

function findActionsVisited(log) {
  const allActions = log.response.output.debug?.turn_events?.map((action) => {
    return action.source.action_title;
  });
  const filteredDuplicates = [...new Set(allActions)];
  return filteredDuplicates;
}

function findIntents(log) {
  return log.response.output.intents?.map((intent) => {
    return intent.intent;
  });
}

function intentsConfidence(log) {
  return log.response.output.intents?.map((intent) => {
    return intent.confidence;
  });
}

function findEntities(log) {
  return log.response.output.entities
    ?.map((entity) => {
      return entity.entity;
    })
    .join(" , ");
}

module.exports = {
  handleLogs,
};
