import api from "../services/api";

export async function runExperiment(params) {
  await api.post("/ibmid/curator/experiment", {
    resources: {
      assistantGuid: params.assistantGuid,
      workspaceId: params.workspaceId,
      skillJSON: params.skillJSON,
      connStr: params.connStr,
      schema: params.schema,
      actions: params.actions,
    },
  });
}
