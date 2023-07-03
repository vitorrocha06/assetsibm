function contextVariablesTable(logs) {
  const skillVariables = logs
    .map((log) => {
      return {
        conversationID: log.request.context.conversation_id,
        variables:
          log.response.context?.skills["actions skill"]?.skill_variables,
      };
    })
    .filter((skillVariable) => {
      return (
        skillVariable.variables &&
        Object.keys(skillVariable.variables).length > 0
      );
    });

  return skillVariables.reduce(
    (acc, skillVariable) =>
      (acc = acc.concat(
        Object.entries(skillVariable.variables).map(([key, value]) => {
          return {
            conversationID: skillVariable.conversationID,
            envVariableName: key,
            envVariableValue: JSON.stringify(value).replace(/'|"/g, ""),
            envVariableType: typeof value,
          };
        })
      )),
    []
  );
}

module.exports = {
  contextVariablesTable,
};
