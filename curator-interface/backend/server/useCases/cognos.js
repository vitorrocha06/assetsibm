const {
  getCognosSession,
  initializeDashboard,
  initializeExperiments,
} = require("../helpers/cognos");

async function cognosSession(req, res) {
  const { username, password } = req.body;
  res.send(
    await getCognosSession(
      username ?? process.env.COGNOS_USERNAME,
      password ?? process.env.COGNOS_PASSWORD
    )
  );
}

function initializeDashboardController(req, res) {
  const { xsd, jdbcUrl, driverClassName, schema, user, password } = req.body;
  console.log(schema);
  res.send(
    initializeDashboard(
      xsd,
      jdbcUrl,
      driverClassName,
      schema,
      // "CURATOR",
      user,
      password
      // process.env.DB2_XSD,
      // process.env.DB2_JDBC,
      // process.env.DB2_DRIVER,
      // process.env.DB2_SCHEMA,
      // process.env.DB2_USER,
      // process.env.DB2_PASSWORD
    )
  );
}

function initializeExperimentsController(req, res) {
  const { xsd, jdbcUrl, driverClassName, schema, user, password } = req.body;
  console.log(schema);
  res.send(
    initializeExperiments(
      xsd,
      jdbcUrl,
      driverClassName,
      schema,
      // "CURATOR",
      user,
      password
      // process.env.DB2_XSD,
      // process.env.DB2_JDBC,
      // process.env.DB2_DRIVER,
      // process.env.DB2_SCHEMA,
      // process.env.DB2_USER,
      // process.env.DB2_PASSWORD
    )
  );
}

module.exports = {
  cognosSession,
  initializeDashboardController,
  initializeExperimentsController,
};
