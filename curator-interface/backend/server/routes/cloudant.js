// import dependencies and initialize the express router
const express = require("express");
const router = express.Router();

const {
  insertOnCloudantController,
  getFromCloudantController,
  deleteFromCloudantController,
  getAllFromCloudantController,
} = require("../useCases/cloudant");

// define routes
router.post("/insertDashboard", insertOnCloudantController);
router.post("/getDashboard", getFromCloudantController);
router.post("/deleteDashboard", deleteFromCloudantController);
router.get("/publicDashboards", getAllFromCloudantController);
module.exports = router;
