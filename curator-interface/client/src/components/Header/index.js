import React, { useEffect, useState } from "react";
import { useGlobalState } from "../../hooks/globalState";
import {
  Header,
  HeaderGlobalAction,
  HeaderName,
  HeaderNavigation,
  HeaderMenu,
  HeaderMenuItem,
  HeaderGlobalBar,
} from "@carbon/react";

import {
  Close,
  Menu,
  Asleep,
  Light,
  Information,
  Save,
  Settings,
  UserIdentification,
  Share,
} from "@carbon/icons-react";
import SideMenu from "../SideNav";

import { useLocation, useNavigate, useParams } from "react-router-dom";

import "./style.scss";
import { getRoute } from "../../helpers/misc";
import { UseFlowModal } from "../UseFlowModal";

export default function HeaderIcc({ renderSave }) {
  const { language, disableAllInputs } = useParams();
  const {
    lightMode,
    setLightMode,
    languageIcons,
    assistants,
    selectedAssistant,
    setSelectedAssistant,
    setOpenSaveLoadModal,
    setOpenActionInputModal,
    setOpenManualInputModal,
    setAccountModalOpen,
    setPublicDashboardsModalOpen,
  } = useGlobalState();

  const location = useLocation();
  const navigate = useNavigate();

  const [openSidePanel, setOpenSidePanel] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <Header aria-label="Assistant Curator">
        {location.pathname.includes("login") ||
        location.pathname.includes("view") ? (
          ""
        ) : (
          <HeaderGlobalAction
            className="navMenu"
            onClick={() => setOpenSidePanel(!openSidePanel)}
          >
            {openSidePanel ? <Close /> : <Menu />}
          </HeaderGlobalAction>
        )}
        <HeaderName
          onClick={() => navigate(`/${language}/lobby`)}
          prefix="Innovation Studio"
          style={{ cursor: "pointer" }}
        >
          Assistant Curator
        </HeaderName>
        {location.pathname.includes("login") ||
        location.pathname.includes("view") ? (
          ""
        ) : (
          <>
            <HeaderGlobalBar>
              <HeaderNavigation aria-label="language-bar">
                <HeaderMenu
                  aria-label="assistants"
                  menuLinkName={
                    selectedAssistant?.SKILL_NAME ?? "Não há WA cadastrados"
                  }
                >
                  {assistants?.map((assistant, index) => {
                    return (
                      <HeaderMenuItem
                        key={index}
                        onClick={() => {
                          setSelectedAssistant(assistant);
                        }}
                      >
                        {assistant?.SKILL_NAME}
                      </HeaderMenuItem>
                    );
                  })}
                </HeaderMenu>
                <HeaderMenu
                  aria-label="language"
                  menuLinkName={languageIcons[language]}
                >
                  {Object.entries(languageIcons).map(([key, value], index) => (
                    <HeaderMenuItem
                      key={index}
                      onClick={() => {
                        navigate(getRoute(location.pathname, key));
                      }}
                    >
                      {value}
                      {` ${key.toUpperCase()}`}
                    </HeaderMenuItem>
                  ))}
                </HeaderMenu>
                {location.pathname.includes("assistants") && (
                  <HeaderMenu
                    aria-label="Advanced Settings"
                    renderMenuContent={Settings}
                  >
                    <HeaderMenuItem
                      key={"advanced-settings-0"}
                      onClick={() => {
                        setOpenActionInputModal(true);
                      }}
                    >
                      Assistente Actions
                    </HeaderMenuItem>
                    <HeaderMenuItem
                      key={"advanced-settings-1"}
                      onClick={() => {
                        setOpenManualInputModal(true);
                      }}
                    >
                      Cadastro Manual
                    </HeaderMenuItem>
                  </HeaderMenu>
                )}
              </HeaderNavigation>
              {renderSave && (
                <>
                  <HeaderGlobalAction
                    aria-label="Save"
                    onClick={() => {
                      setOpenSaveLoadModal(true);
                    }}
                  >
                    <Save />
                  </HeaderGlobalAction>
                  <HeaderGlobalAction
                    aria-label="Share"
                    onClick={() => {
                      setPublicDashboardsModalOpen(true);
                    }}
                  >
                    <Share />
                  </HeaderGlobalAction>
                </>
              )}
              {location.pathname.includes("assistants") ? (
                <>
                  <HeaderGlobalAction
                    aria-label="Account"
                    onClick={() => {
                      setAccountModalOpen(true);
                    }}
                  >
                    <UserIdentification />
                  </HeaderGlobalAction>
                </>
              ) : (
                ""
              )}
              <HeaderGlobalAction
                aria-label="Theme"
                onClick={() => {
                  setLightMode(!lightMode);
                }}
              >
                {lightMode ? <Asleep /> : <Light />}
              </HeaderGlobalAction>
            </HeaderGlobalBar>
            <SideMenu open={openSidePanel} />
          </>
        )}
      </Header>
      {location.pathname.includes("login") ||
      location.pathname.includes("view") ? (
        ""
      ) : (
        <div id="helpModalToggle" onClick={() => setOpenModal(true)}>
          <Information size={30} color="white" />
        </div>
      )}
      <UseFlowModal openModal={openModal} setOpenModal={setOpenModal} />
    </>
  );
}
