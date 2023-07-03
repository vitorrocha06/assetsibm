const path = require("path");
const {
  createAssistant,
  waitForAssistantsAvailability,
  deleteAssistants,
  createAssistantClient,
} = require("./assistant");

const { generateReports } = require("./experimentAnalysis");
const { generateTrainingData } = require("./generateTrainingData");
const { runTests } = require("./k-folds");

async function runExperiment(assistantCreds) {
  console.log("Starting experiment!");
  const { apiKey, url, workspaceID } = assistantCreds;

  const client = createAssistantClient(apiKey, url);

  const folds = await generateTrainingData(client, workspaceID);

  const results = await Promise.allSettled(
    folds.map((fold) => createAssistant(client, fold.train))
  );
  let assistantStatus = results.map((creationResult) => ({
    skillID: creationResult.value,
    status: "starting...",
  }));
  console.log("ASSISTANTS CREATED!\n");

  await waitForAssistantsAvailability(client, assistantStatus);
  console.log("ASSISTANTS READY!\n");

  let predictions = await Promise.all(
    assistantStatus.map((model, i) => runTests(client, model, folds[i].test))
  );
  predictions = predictions.reduce(
    (predictions, foldPredictions) => [...predictions, ...foldPredictions],
    []
  );

  deleteAssistants(client, [], null);

  const experimentResults = {
    predictions: predictions.sort(
      (p1, p2) => JSON.stringify(p1) > JSON.stringify(p2)
    ),
    reports: generateReports(predictions),
  };

  // fs.writeFileSync(`results.json`, JSON.stringify(experimentResults, null, 2));
  return experimentResults;
}

module.exports = {
  runExperiment,
};
