const { shuffle } = require("shuffle-seed");

const { messageAssistant } = require("./assistant");

const batchSize = 10;
const maxRetries = 4;
const throttle = 1000;

function createFolds(data, numFolds) {
  return shuffle(data, Math.random()).reduce(
    (exampleGroups, example, i) =>
      exampleGroups.map((f, j) =>
        i % numFolds === j
          ? { train: f.train, test: f.test.concat(example) }
          : { train: f.train.concat(example), test: f.test }
      ),
    Array(numFolds).fill({ train: [], test: [] })
  );
}

async function runTests(client, model, tests) {
  console.log(`[K-FOLD] [${model.skillID}] STARTING TESTS`);
  let allResponses = [];

  for (let i = 0; i < tests.length; i += batchSize) {
    console.log(
      `[K-FOLD] [${model.skillID}] STARTING BATCH ${i} - ${i + batchSize}`
    );
    let batch = tests.slice(i, i + batchSize);
    let responses = await Promise.all(
      batch.map(async (example) => {
        let result = await predictRetry(
          client,
          model,
          example.input.text,
          maxRetries
        );
        return {
          input: example.input.text,
          true_class: example.class,
          output: result,
        };
      })
    );
    allResponses = [...allResponses, ...responses];
    console.log(
      `[K-FOLD] [${model.skillID}] FINISHED BATCH ${i} - ${i + batchSize}`
    );
    await new Promise((r) => setTimeout(() => r(), throttle));
  }
  return allResponses;
}

async function predictRetry(client, model, input, retries) {
  try {
    return await messageAssistant(client, model.skillID, input);
  } catch (err) {
    console.log(`[K-FOLD] PREDICTION FAILED. ${retries} RETRIES LEFT`);
    if (retries <= 0) throw err;
    return predictRetry(client, model, input, retries - 1);
  }
}

module.exports = {
  createFolds,
  runTests,
};
