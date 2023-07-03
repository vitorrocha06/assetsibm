// import dependencies and initialize the express router
const express = require("express");
const router = express.Router();

const {
  getLogs,
  updateScore,
  refreshExperimentController,
} = require("../useCases/db2");

// define routes
router.post("/getLogs", getLogs);
router.post("/updateScore", updateScore);
router.post("/refreshExperiment", refreshExperimentController);

module.exports = router;
