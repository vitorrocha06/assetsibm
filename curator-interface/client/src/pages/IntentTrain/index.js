import React, { useEffect, useState } from "react";
import { useGlobalState } from "../../hooks/globalState";
import Header from "../../components/Header";

import { Button, Loading, Theme } from "@carbon/react";
import { useParams } from "react-router-dom";
import {
  getCognosSession,
  initializeExperiments,
} from "../../helpers/cognosApiCalls";
import { refreshExperiment } from "../../helpers/db2ApiCalls";

import "./style.scss";

import CognosApi from "../../helpers/cognos";
import { runExperiment } from "../../helpers/cloudFunctionsApiCalls";

export default function CognosPage() {
  const { language } = useParams();
  const {
    lightMode,
    loading,
    setLoading,
    selectedAssistant,
    cognosSession,
    setCognosSession,
  } = useGlobalState();

  const [skillJSON, setSkillJSON] = useState(null);

  useEffect(async () => {
    setCognosSession(null);

    const session = await getCognosSession(
      selectedAssistant.cognos.CLIENT_ID,
      selectedAssistant.cognos.CLIENT_SECRET
    );
    if (session.data.Error) {
      setCognosSession(null);
    } else {
      setCognosSession(session.data);
    }
  }, []);

  useEffect(async () => {
    setCognosSession(null);

    const session = await getCognosSession(
      selectedAssistant.cognos.CLIENT_ID,
      selectedAssistant.cognos.CLIENT_SECRET
    );
    if (session.data.Error) {
      setCognosSession(null);
    } else {
      setCognosSession(session.data);
    }
  }, [selectedAssistant]);

  useEffect(async () => {
    if (cognosSession && typeof cognosSession === "string") {
      const cognosApi = new CognosApi({
        cognosRootURL:
          "https://us-south.dynamic-dashboard-embedded.cloud.ibm.com/daas/",
        node: document.getElementById("cognosDiv"),
        sessionCode: cognosSession,
        language: language,
      });

      await initializeDashboard(cognosApi);
    }
  }, [cognosSession]);

  async function initializeDashboard(cognosApi) {
    cognosApi.initialize().then(async () => {
      cognosApi.dashboard
        .openDashboard({
          dashboardSpec: await initializeExperiments(
            selectedAssistant.db2.XSD_MODULE,
            selectedAssistant.db2.JDBC_URL.replace(
              "user=<userid>;password=<your_password>;",
              ""
            ),
            selectedAssistant.db2.DRIVER,
            selectedAssistant.SKILL_NAME.replace(
              /[\- \/\\]/g,
              ""
            ).toUpperCase(),
            selectedAssistant.db2.USERNAME,
            selectedAssistant.db2.PASSWORD
          ),
        })
        .then(async (dashboardAPI) => {
          dashboardAPI.setMode(dashboardAPI.MODES.VIEW);

          dashboardAPI.on(dashboardAPI.EVENTS.DIRTY, async () => {
            const dashSpec = await dashboardAPI.getSpec();
            console.log(dashSpec);
          });
        });
    });
  }

  return (
    <Theme theme={lightMode ? "white" : "g100"}>
      <Header />
      <div className="content">
        {loading ? <Loading /> : ""}
        {cognosSession && <div id="cognosDiv"></div>}
        <div id="newExperimentButton">
          <Button
            id="runExperimentButton"
            onClick={async () => {
              setLoading(true);
              await refreshExperiment(
                selectedAssistant.db2.CONNECTION_STRING,
                selectedAssistant.SKILL_NAME.replace(
                  /[\- \/\\]/g,
                  ""
                ).toUpperCase()
              );
              await runExperiment({
                assistantGuid: selectedAssistant.ASSISTANT_GUID,
                workspaceId: selectedAssistant.WORKSPACE_ID,
                skillJSON: skillJSON,
                connStr: selectedAssistant.db2.CONNECTION_STRING,
                schema: selectedAssistant.SKILL_NAME.replace(
                  /[\- \/\\]/g,
                  ""
                ).toUpperCase(),
                actions: selectedAssistant.ASSISTANT_ID ? true : false,
              });
              setLoading(false);
            }}
          >
            Realizar novo teste
          </Button>
        </div>
      </div>
    </Theme>
  );
}
