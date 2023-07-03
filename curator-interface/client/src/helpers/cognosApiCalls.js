import api from "../services/api";

export async function getCognosSession(username, password) {
  return await api.post("/cognos/createSession", {
    username: username,
    password: password,
  });
}

export async function initializeSources(
  xsd,
  jdbcUrl,
  driverClassName,
  schema,
  user,
  password
) {
  const response = await api.post("/cognos/initializeDashboard", {
    xsd: xsd,
    jdbcUrl: jdbcUrl,
    driverClassName: driverClassName,
    schema: schema,
    user: user,
    password: password,
  });

  delete response.data._id;
  delete response.data._rev;

  return response.data;
}

export async function initializeExperiments(
  xsd,
  jdbcUrl,
  driverClassName,
  schema,
  user,
  password
) {
  const response = await api.post("/cognos/initializeExperiments", {
    xsd: xsd,
    jdbcUrl: jdbcUrl,
    driverClassName: driverClassName,
    schema: schema,
    user: user,
    password: password,
  });

  delete response.data._id;
  delete response.data._rev;

  return response.data;
}
