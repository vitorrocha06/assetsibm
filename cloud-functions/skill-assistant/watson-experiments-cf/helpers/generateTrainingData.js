const fs = require("fs");
const path = require("path");
const { getIntentsAndExamples } = require("./assistant");

const { createFolds } = require("./k-folds");

async function generateTrainingData(client, id) {
  let intents = await getIntentsAndExamples(client, id, [], null);

  intents = intents.reduce(
    (examples, intent) => [
      ...examples,
      ...intent.examples.map((e) => ({
        input: { text: e.text },
        class: intent.intent,
      })),
    ],
    []
  );

  // Partitioning data into folds
  const folds = await createFolds(intents, 3);
  return folds;
}

module.exports = { generateTrainingData };
