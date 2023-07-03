import {
  ComposedModal,
  ModalHeader,
  ModalFooter,
  Button,
  ModalBody,
  TextInput,
} from "@carbon/react";
import { useState } from "react";
import {
  getFromCloudant,
  sendToCloudant,
} from "../../helpers/cloudantApiCalls";
import { useGlobalState } from "../../hooks/globalState";

export function SaveLoadModal({
  setLoadedDashboard,
  currentDashboard,
  setShowNotification,
  setNotificationContent,
}) {
  const {
    dbName,
    setDbName,
    selectedAssistant,
    openSaveLoadModal,
    setOpenSaveLoadModal,
  } = useGlobalState();

  return (
    <>
      <ComposedModal
        open={openSaveLoadModal}
        onRequestClose={() => {
          setOpenSaveLoadModal(false);
        }}
        onClose={() => {
          setOpenSaveLoadModal(false);
        }}
        preventCloseOnClickOutside={true}
      >
        <ModalHeader label="Gerenciar Dashboards">
          <p>
            Use este modal para salvar esta versão do atual dashboard ou para
            carregar alguma versão anteriormente salva.
          </p>
        </ModalHeader>
        <ModalBody>
          <TextInput
            onChange={(e) => {
              setDbName(e.target.value.toLowerCase());
            }}
            labelText="Qual nome do dashboard?"
          />
        </ModalBody>
        <ModalFooter>
          <Button
            kind="secondary"
            onClick={async () => {
              const dashboard = await getFromCloudant(
                dbName,
                selectedAssistant.cloudant.APIKEY,
                selectedAssistant.cloudant.URL
              );
              if (dashboard) {
                setLoadedDashboard(dashboard);
                setNotificationContent({
                  title: "Inicializando",
                  text: `Carregando dashboard ${dbName}...`,
                  kind: "info",
                });
                setShowNotification(true);
              } else {
                setDbName(null);
                setLoadedDashboard(null);
                setNotificationContent({
                  title: "Erro",
                  text: "Não foi possível carregar esta dashboard...",
                  kind: "error",
                });
                setShowNotification(true);
              }
              setOpenSaveLoadModal(false);
            }}
          >
            Buscar
          </Button>
          <Button
            kind="primary"
            onClick={async () => {
              const insertionResult = await sendToCloudant(
                dbName,
                selectedAssistant.cloudant.APIKEY,
                selectedAssistant.cloudant.URL,
                currentDashboard
              );
              if (!insertionResult) {
                setDbName(null);
                setNotificationContent({
                  title: "Erro",
                  text: "Não foi possível salvar esta dashboard...",
                  kind: "error",
                });
                setShowNotification(true);
              }
              setOpenSaveLoadModal(false);
            }}
          >
            Salvar
          </Button>
        </ModalFooter>
      </ComposedModal>
    </>
  );
}
