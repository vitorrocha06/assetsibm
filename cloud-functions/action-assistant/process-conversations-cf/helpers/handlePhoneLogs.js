const searchedKeys = {
  userNumber:
    "response.context.integrations?.voice_telephony?.private?.user_phone_number",
  vgwPhoneUserPhoneNumber:
    "response.context.skills['main skill']?.user_defined?.vgwPhoneUserPhoneNumber",
  vgwIsDTMF: "response.context.skills['main skill']?.user_defined?.vgwIsDTMF",
  vgwBargeInOccurred:
    "response.context.skills['main skill']?.user_defined?.vgwBargeInOccurred",
};

function phoneTable(groupsAndIntervals, groups, finalNode) {
  return groupsAndIntervals
    .map((conversation) => {
      if (conversation.channel === "Phone") {
        return checkLogs(groups[conversation.conversationID], finalNode);
      }
    })
    .filter((result) => result);
}

function checkLogs(logs, finalNode) {
  const userNumber = logs.find((log) => {
    return log[searchedKeys.userNumber] != "";
  }).response.context.integrations?.voice_telephony?.private?.user_phone_number;
  const vgwPhoneUserPhoneNumber = logs.find((log) => {
    return log[searchedKeys.vgwPhoneUserPhoneNumber] != "";
  }).response.context.skills["main skill"]?.user_defined
    ?.vgwPhoneUserPhoneNumber;
  const vgwIsDTMF = logs.some((log) => {
    return (
      log.response.context.skills["main skill" || "actions skill"]?.user_defined
        ?.vgwIsDTMF == "Yes"
    );
  });
  const vgwBargeInOccurred = logs.some((log) => {
    return (
      log.response.context.skills["main skill" || "actions skill"]?.user_defined
        ?.vgwBargeInOccurred == "Yes"
    );
  });

  return {
    idUser: logs[0].request.context.metadata.user_id,
    conversationID: logs[0].request.context.conversation_id,
    userNumber: userNumber ? userNumber : "",
    vgwPhoneUserPhoneNumber: vgwPhoneUserPhoneNumber
      ? vgwPhoneUserPhoneNumber
      : "",
    vgwIsDTMF: vgwIsDTMF ? 1 : 0,
    vgwBargeInOccurred: vgwBargeInOccurred ? 1 : 0,
    concluded: checkConclusion(logs, finalNode) ? 1 : 0,
  };
}

function checkConclusion(logs, finalNode) {
  const allActions = logs.reduce(
    (acc, log) =>
      (acc = acc.concat(
        log.response.output.debug?.turn_events?.map(
          (action) => action.source.action_title
        )
      )),
    []
  );
  return allActions.some((action) =>
    finalNode.some((search) => action == search)
  );
}

module.exports = {
  phoneTable,
};
