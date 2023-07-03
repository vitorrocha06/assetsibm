import React, { useContext, useState, createContext, useEffect } from "react";

import { US, BR, ES } from "country-flag-icons/react/3x2";
import { getPublicDashbords } from "../helpers/cloudantApiCalls";

const GlobalStateContext = createContext({});

export default function GlobalStateProvider({ children }) {
  const languageIcons = { pt: <BR />, es: <ES />, en: <US /> };

  const [interestModal, setInterestModal] = useState(true);
  const [lightMode, setLightMode] = useState("en");
  const [loading, setLoading] = useState(false);

  const [logged, setLogged] = useState(false);

  const [assistants, setAssistants] = useState(null);

  const [accounts, setAccounts] = useState(null);
  const [account, setAccount] = useState(null);
  const [accountModalOpen, setAccountModalOpen] = useState(true);

  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [resources, setResources] = useState(null);

  const [dbName, setDbName] = useState(null);
  const [cognosSession, setCognosSession] = useState(null);

  const [logs, setLogs] = useState(null);

  const [openSaveLoadModal, setOpenSaveLoadModal] = useState(false);
  const [loadedDashboard, setLoadedDashboard] = useState(null);

  const [publicDashboardsModalOpen, setPublicDashboardsModalOpen] =
    useState(false);
  const [publicDashboards, setPublicDashboards] = useState([]);

  const [openActionInputModal, setOpenActionInputModal] = useState(false);
  const [openManualInputModal, setOpenManualInputModal] = useState(false);

  const [disableAllInputs, setDisableAllInputs] = useState(false);

  // pagination
  const [itensPerPage, setItensPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const startIndex = (currentPage - 1) * itensPerPage;
  const endIndex = startIndex + itensPerPage;

  useEffect(() => {
    if (assistants) {
      if (!selectedAssistant) {
        setSelectedAssistant(assistants[0]);
      }
    }
  }, [assistants]);

  return (
    <GlobalStateContext.Provider
      value={{
        languageIcons,
        interestModal,
        setInterestModal,
        lightMode,
        setLightMode,
        loading,
        setLoading,
        logged,
        setLogged,
        assistants,
        setAssistants,
        accounts,
        setAccounts,
        account,
        setAccount,
        accountModalOpen,
        setAccountModalOpen,
        selectedAssistant,
        setSelectedAssistant,
        resources,
        setResources,
        dbName,
        setDbName,
        cognosSession,
        setCognosSession,
        logs,
        setLogs,
        openSaveLoadModal,
        setOpenSaveLoadModal,
        loadedDashboard,
        setLoadedDashboard,
        publicDashboardsModalOpen,
        setPublicDashboardsModalOpen,
        publicDashboards,
        setPublicDashboards,
        openActionInputModal,
        setOpenActionInputModal,
        openManualInputModal,
        setOpenManualInputModal,
        disableAllInputs,
        setDisableAllInputs,
        itensPerPage,
        setItensPerPage,
        currentPage,
        setCurrentPage,
        startIndex,
        endIndex,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
}

export function useGlobalState() {
  const context = useContext(GlobalStateContext);

  if (!context) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }

  return context;
}
