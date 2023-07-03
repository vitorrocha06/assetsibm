import api from "../services/api";

export async function getLogs({
  connectionString,
  schema,
  lastDate,
  date,
  intent,
}) {
  const response = await api.post("/db2/getLogs", {
    connStr: connectionString,
    schema: schema,
    lastDate: lastDate,
    date: date,
    intent: intent,
  });

  if (response.data.intents && Object.keys(response.data.intents).length > 0) {
    return response.data.intents;
  } else {
    return null;
  }
}

export async function sendScore(logs, connectionString, schema) {
  await api.post("/db2/updateScore", {
    conversation: logs,
    connStr: connectionString,
    schema: schema,
  });

  let updateRender = [];
  Object.entries(logs).map(([key, value]) => {
    updateRender.push([key, value.filter((obj) => obj.SCORE === null)]);
  });
  updateRender = updateRender.filter(([key, value]) => value.length !== 0);

  return Object.fromEntries(updateRender);
}

export async function refreshExperiment(connectionString, schema) {
  console.log(
    await api.post("/db2/refreshExperiment", {
      connStr: connectionString,
      schema: schema,
    })
  );
}
