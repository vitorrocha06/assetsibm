import React, { useEffect, useRef, useState } from "react";
import { useGlobalState } from "../../hooks/globalState";
import Header from "../../components/Header";

import { Loading, Theme } from "@carbon/react";
import { useParams } from "react-router-dom";
import {
  getCognosSession,
  initializeSources,
} from "../../helpers/cognosApiCalls";

import "./style.scss";

import CognosApi from "../../helpers/cognos";
import { SaveLoadModal } from "../../components/SaveLoadModal";
import { Notification } from "../../components/Notification";
import { PublicDashboardsModal } from "../../components/PublicDashboardsModal";

export default function CognosPage() {
  const { language } = useParams();
  const {
    lightMode,
    loading,
    setLoading,
    selectedAssistant,
    dbName,
    setDbName,
    cognosSession,
    setCognosSession,
    loadedDashboard,
    setLoadedDashboard,
  } = useGlobalState();
  const [renderSave, setRenderSave] = useState(false);

  const [currentDashboard, setCurrentDashboard] = useState(null);

  const [showNotification, setShowNotification] = useState(true);
  const [notificationContent, setNotificationContent] = useState({
    title: "Inicializando",
    text: `Carregando dashboard ${dbName ?? "padrão"}...`,
    kind: "info",
  });

  const notInitialRender = useRef(false);

  useEffect(async () => {
    startCognosSession();
  }, []);

  useEffect(async () => {
    if (notInitialRender.current) {
      setLoadedDashboard(null);
      startCognosSession();
    } else {
      notInitialRender.current = true;
    }
  }, [selectedAssistant]);

  useEffect(async () => {
    if (notInitialRender.current) {
      startCognosSession();
    } else {
      notInitialRender.current = true;
    }
  }, [loadedDashboard]);

  useEffect(() => {
    console.log(currentDashboard), [currentDashboard];
  });

  async function startCognosSession() {
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
  }

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
          dashboardSpec:
            loadedDashboard ??
            (await initializeSources(
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
            )),
        })
        // .createNew()
        .then(async (dashboardAPI) => {
          dashboardAPI.setMode(dashboardAPI.MODES.EDIT);
          const dashSpec = await dashboardAPI.getSpec();
          setCurrentDashboard(dashSpec);
          setRenderSave(true);
          dashboardAPI.on(dashboardAPI.EVENTS.DIRTY, async () => {
            const dashSpec = await dashboardAPI.getSpec();
            setCurrentDashboard(dashSpec);
          });
        });
    });
  }

  return (
    <Theme theme={lightMode ? "white" : "g100"}>
      {loading ? <Loading /> : ""}
      <Header renderSave={renderSave} />
      <div className="content">
        {cognosSession && <div id="cognosDiv"></div>}
      </div>
      <SaveLoadModal
        dbName={dbName}
        setDbName={setDbName}
        setLoadedDashboard={setLoadedDashboard}
        currentDashboard={currentDashboard}
        setShowNotification={setShowNotification}
        setNotificationContent={setNotificationContent}
      />
      <PublicDashboardsModal
        currentDashboard={currentDashboard}
        setCurrentDashboard={setCurrentDashboard}
      />
      {showNotification && (
        <Notification
          setShowNotification={setShowNotification}
          notificationContent={notificationContent}
          setNotificationContent={setNotificationContent}
        />
      )}
    </Theme>
  );
}
