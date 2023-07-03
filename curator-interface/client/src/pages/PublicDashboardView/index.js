import React, { useEffect, useRef, useState } from "react";
import { useGlobalState } from "../../hooks/globalState";
import Header from "../../components/Header";

import { Theme } from "@carbon/react";
import { useParams } from "react-router-dom";
import { getCognosSession } from "../../helpers/cognosApiCalls";

import "./style.scss";

import CognosApi from "../../helpers/cognos";
import { Notification } from "../../components/Notification";
import {
  getFromCloudant,
  getPublicDashbords,
} from "../../helpers/cloudantApiCalls";

export default function PublicDashboardView() {
  const { language, dashID } = useParams();
  const { lightMode, loading, setLoading, cognosSession, setCognosSession } =
    useGlobalState();

  const [dashboard, setDashboard] = useState({});

  useEffect(async () => {
    startCognosSession();
  }, []);

  async function startCognosSession() {
    const dash = await getFromCloudant(dashID, null, null, true);
    setDashboard(dash);

    setCognosSession(null);
    const session = await getCognosSession(null, null);
    if (session.data.Error) {
      setCognosSession(null);
    } else {
      setCognosSession(session.data);
    }
  }

  useEffect(async () => {
    if (cognosSession && typeof cognosSession === "string") {
      const cognosApi = new CognosApi({
        cognosRootURL:
          "https://us-south.dynamic-dashboard-embedded.cloud.ibm.com/daas/",
        node: document.getElementById("cognosDiv"),
        sessionCode: cognosSession,
        language: language ?? "en",
      });

      await initializeDashboard(cognosApi);
    }
  }, [cognosSession]);

  async function initializeDashboard(cognosApi) {
    cognosApi.initialize().then(async () => {
      cognosApi.dashboard
        .openDashboard({
          dashboardSpec: dashboard,
        })
        .then(async (dashboardAPI) => {
          dashboardAPI.setMode(dashboardAPI.MODES.VIEW);
          const dashSpec = await dashboardAPI.getSpec();
          console.log(dashSpec);
        });
    });
  }

  return (
    <Theme theme={lightMode ? "white" : "g100"}>
      <Header />
      <div className="viewContent" style={{ width: "100%", height: "100%" }}>
        {cognosSession && <div id="cognosDiv"></div>}
      </div>
    </Theme>
  );
}
