import React from "react";
import { Route, Routes, BrowserRouter, Navigate } from "react-router-dom";
import Login from "./pages/Login/index";
import Lobby from "./pages/Lobby/index";
import NewAssistantForm from "./pages/NewAssistantForm/index";
import IntentTrain from "./pages/IntentTrain/index";
import ConversationPerformance from "./pages/ConversationPerformance/index";

import GlobalStateProvider, { useGlobalState } from "./hooks/globalState";
import { IntentSearch } from "./pages/IntentSearch";
import FirstSteps from "./pages/FirstSteps";
import PublicDashboardView from "./pages/PublicDashboardView";

export default function Router() {
  const RequireLogin = ({ children }) => {
    const { logged, assistants } = useGlobalState();
    if (!logged) {
      return <Navigate replace to={"/en/login"} />;
    } else if (!assistants) {
      return <Navigate replace to={"/en/first-steps"} />;
    }
    return children;
  };
  const RequireOnlyLogin = ({ children }) => {
    const { logged } = useGlobalState();
    if (!logged) {
      return <Navigate replace to={"/en/login"} />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      <GlobalStateProvider>
        <Routes>
          <Route path={"/"} element={<Navigate replace to={"/en/login"} />} />
          <Route
            path={"/:language"}
            element={<Navigate replace to={"/en/login"} />}
          />
          <Route path="/:language/login" element={<Login />} />
          <Route path="/:language/first-steps" element={<FirstSteps />} />
          <Route
            path="/:language/assistants"
            element={
              <RequireOnlyLogin>
                <NewAssistantForm />
              </RequireOnlyLogin>
            }
          />

          <Route
            path="/:language/lobby"
            element={
              <RequireLogin>
                <Lobby />
              </RequireLogin>
            }
          />
          <Route
            path="/:language/train"
            element={
              <RequireLogin>
                <IntentTrain />
              </RequireLogin>
            }
          />
          <Route
            path="/:language/intents"
            element={
              <RequireLogin>
                <IntentSearch />
              </RequireLogin>
            }
          />
          <Route
            path="/:language/dashboard"
            element={
              <RequireLogin>
                <ConversationPerformance />
              </RequireLogin>
            }
          />
          <Route
            path={`/:language/view/:dashID`}
            element={<PublicDashboardView />}
          />
          <Route path={`/view/:dashID`} element={<PublicDashboardView />} />
        </Routes>
      </GlobalStateProvider>
    </BrowserRouter>
  );
}
