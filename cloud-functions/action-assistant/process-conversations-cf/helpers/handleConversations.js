const { phoneTable } = require("./handlePhoneLogs");
const fs = require("fs");

function handleConversations(logs, assistantConfig) {
  const { feedbackNode, relevantTopics, finalNode } = assistantConfig;
  const pathObjs = [];
  const groups = groupBy(logs);

  let feedback;
  let transfered;
  let relevance;
  let channel;

  const groupsAndIntervals = Object.entries(groups).map(([key, value]) => {
    channel = null;
    transfered = null;
    relevance = null;
    feedback = null;

    let startTime = value[0].response_timestamp;
    let finisTime = value[value.length - 1].response_timestamp;
    const interval = findInterval(startTime, finisTime);

    for (let log of groups[key]) {
      if (!channel) channel = checkChannel(log) ? "Phone" : "Chat";
      feedback = findFeedBack(log, feedbackNode);
      if (!transfered) transfered = checkIfTransfered(log) ? 1 : 0;
      if (!relevance) relevance = checkRelevance(log, relevantTopics) ? 1 : 0;

      const actionsVisited = findActionsVisited(log);
      pathObjs.push({
        conversationID: key,
        originNode: actionsVisited.length > 0 ? actionsVisited[0] : "",
        destineNode: "conversationEnd",
      });
      if (pathObjs.filter((e) => e.conversationID === key).length > 1) {
        if (pathObjs[pathObjs.length - 2])
          pathObjs[pathObjs.length - 2].destineNode =
            actionsVisited.length > 0 ? actionsVisited[0] : "";
      }
    }

    return {
      idUser: value[0].request.context.metadata?.user_id
        ? value[0].request.context.metadata.user_id
        : "",
      conversationID: key,
      channel: channel,
      startTime: value[0].request_timestamp,
      interval: interval,
      feedback: feedback ? feedback : 0,
      transfered: transfered,
      relevance: relevance,
    };
  });

  const phoneObjects = phoneTable(groupsAndIntervals, groups, finalNode);

  return {
    conversationTable: checkIfUserIsNew(groupsAndIntervals),
    phoneTable: phoneObjects,
    path: pathObjs,
  };
}

function groupBy(array) {
  return array.reduce((objectsByKeyValue, obj) => {
    const value = obj.request.context.conversation_id;
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});
}

function findInterval(start, finish) {
  let interval = Math.abs(new Date(finish) - new Date(start));
  let resultingDate = new Date(interval);

  let seconds = resultingDate / 1000;
  return Math.abs(seconds);
}

function findFeedBack(log, feedbackNode) {
  const feedbackTurnEvent = log.response.output.debug?.turn_events?.filter(
    (event) =>
      feedbackNode.some((search) => search == event.source.action_title)
        ? event.action_variables
        : null
  );
  if (feedbackTurnEvent.length > 0) {
    return handleFeedback(feedbackTurnEvent[0]);
  }
}

function handleFeedback(feedbackTurnEvent) {
  const possibleValues = Object.values(
    feedbackTurnEvent.action_variables
  ).filter((value) => typeof value === "number");
  return possibleValues[0];
}

function checkChannel(log) {
  if (
    log.request?.context?.skills?.["main skill" || "actions skill"]
      ?.user_defined
  )
    return Object.keys(
      log.request?.context?.skills?.["main skill" || "actions skill"]
        .user_defined
    ).includes("vgwSessionID");
}

function checkIfTransfered(log) {
  return log.response.output.debug?.turn_events?.some(
    (event) =>
      event.source.action_title === "Fallback" &&
      event.reason === "connect_to_agent"
  );
}

function checkRelevance(log, relevantTopics) {
  const actionsVisited = findActionsVisited(log);
  return actionsVisited.some((action) => {
    return relevantTopics.some((topic) => topic === action);
  });
}

function checkIfUserIsNew(groups) {
  let knownUsers = [];

  for (let group of groups) {
    if (knownUsers.includes(group.idUser)) group["newUser"] = 0;
    else {
      group["newUser"] = 1;
      knownUsers.push(group.idUser);
    }
  }
  return groups;
}

function findActionsVisited(log) {
  const allActions = log.response.output.debug?.turn_events?.map((action) => {
    return action.source.action_title;
  });
  const filteredDuplicates = [...new Set(allActions)];
  return filteredDuplicates.filter((action) => action);
}

module.exports = {
  handleConversations,
};
