// import dependencies and initialize the express router
const express = require("express");
const router = express.Router();

const {
  cognosSession,
  initializeDashboardController,
  initializeExperimentsController,
} = require("../useCases/cognos");

// define routes
router.post("/createSession", cognosSession);
router.post("/initializeDashboard", initializeDashboardController);
router.post("/initializeExperiments", initializeExperimentsController);

module.exports = router;
