import {
  ComposedModal,
  ModalHeader,
  ModalFooter,
  Button,
  ModalBody,
  TextInput,
  Grid,
  Column,
  FileUploader,
  MultiSelect,
} from "@carbon/react";
import { FormGroup } from "@mui/material";
import { useEffect, useState } from "react";
import { getAssistants } from "../../helpers/resourcesApiCalls";
import { useGlobalState } from "../../hooks/globalState";

export function ActionInputModal({
  resourceData,
  setResourceData,
  disableAllInputs,
  setDisableInput,
  setResponseAssistants,
  setAssistantDetails,
  setShowNotification,
  setNotificationContent,
  skillJson,
  setSkillJson,
}) {
  const { openActionInputModal, setOpenActionInputModal, setLoading } =
    useGlobalState();

  function handleFileSelect(event) {
    const reader = new FileReader();
    reader.onload = handleFileLoad;
    reader.readAsText(event.target.files[0]);
  }

  function handleFileLoad(event) {
    try {
      setSkillJson(JSON.parse(event.target.result));
    } catch (err) {
      clearMultiSelects();
      setSkillJson(null);
      setDisableInput(false);
      setOpenActionInputModal(false);
      setNotificationContent({
        title: "Arquivo inválido",
        text: `Este json não parece ser de uma skill de actions!`,
        kind: "error",
      });
      setShowNotification(true);
    }
  }

  function clearMultiSelects() {
    const multiselectElements = document.getElementsByClassName(
      "cds--tag__close-icon"
    );
    for (let element of multiselectElements) {
      element.click();
    }
    const fileElement = document.getElementsByClassName("cds--file-close");
    for (let element of fileElement) {
      element.click();
    }
  }

  useEffect(() => {
    const tmp = { ...resourceData };
    if (!skillJson) {
      tmp.workspace_id = null;
      tmp.assistant_id = null;
      tmp.environment_id = undefined;
      tmp.actions = null;
      tmp.skill_name = null;
      tmp.assistantMetadata = {
        transferNode: [],
        feedbackNode: [],
        relevantTopics: [],
        finalNode: [],
      };
    } else if (
      !skillJson.name ||
      !skillJson.workspace_id ||
      !skillJson.assistant_id ||
      !skillJson.workspace?.actions
    ) {
      clearMultiSelects();
      setSkillJson(null);
      setDisableInput(false);
      setOpenActionInputModal(false);
      setNotificationContent({
        title: "Arquivo inválido",
        text: `Este json não parece ser de uma skill de actions!`,
        kind: "error",
      });
      setShowNotification(true);
    } else {
      tmp.skill_name = skillJson.name;
      tmp.workspace_id = skillJson.workspace_id;
      tmp.assistant_id = skillJson.assistant_id;
      tmp.actions = true;
      setResponseAssistants(null);
      setAssistantDetails(null);
    }

    setResourceData(tmp);
  }, [skillJson]);

  return (
    <>
      <ComposedModal
        size="lg"
        open={openActionInputModal}
        onRequestClose={() => {
          setOpenActionInputModal(false);
        }}
        onClose={() => {
          setOpenActionInputModal(false);
        }}
        preventCloseOnClickOutside={true}
        hasScrollingContent
      >
        <ModalHeader label="Cadastro de novo Assistant (Actions)">
          <p style={{ textAlign: "justify" }}>
            Atualmente a listagem dos assistentes construídos no modelo de
            Actions está limitada a planos Enterprise. Caso seu assistente não
            tenha aparecido automaticamete, por gentileza envie abaixo o seu
            JSON.
          </p>
        </ModalHeader>
        <ModalBody>
          <Grid>
            {/*File Uploader*/}
            <Column
              className="selectColumnResource"
              sm={4}
              md={8}
              lg={16}
              xlg={16}
            >
              <FileUploader
                disabled={disableAllInputs}
                accept={[".json"]}
                buttonLabel="Selecionar arquivo"
                filenameStatus="edit"
                iconDescription="Cancelar"
                labelDescription="Por gentileza enviar o .json de sua skill."
                labelTitle="Upload de arquivos"
                name=""
                onChange={(e) => {
                  clearMultiSelects();
                  handleFileSelect(e);
                  setDisableInput(true);
                }}
                onDelete={async () => {
                  clearMultiSelects();
                  setSkillJson(null);
                  setDisableInput(false);
                  setOpenActionInputModal(false);
                  setLoading(true);
                  if (resourceData.assistant)
                    setResponseAssistants(
                      await getAssistants(resourceData.assistant)
                    );
                  setLoading(false);
                }}
                size="lg"
              />
            </Column>
            {/*Skill Name*/}
            <Column
              className="selectColumnResource"
              sm={4}
              md={8}
              lg={16}
              xlg={16}
            >
              <TextInput
                labelText="Nome da skill"
                value={
                  disableAllInputs
                    ? "Using Manual Input"
                    : skillJson?.name ?? "Faça upload de um arquivo"
                }
                disabled
              />
            </Column>
            {/*Environment ID*/}
            <Column
              className="selectColumnResource"
              sm={4}
              md={8}
              lg={16}
              xlg={16}
            >
              <TextInput
                disabled={disableAllInputs}
                labelText="Environment ID"
                value={
                  disableAllInputs
                    ? "Using Manual Input"
                    : resourceData.environment_id ?? ""
                }
                onChange={(e) => {
                  const tmp = { ...resourceData };
                  if (e.target.value) {
                    tmp.environment_id = e.target.value;
                  } else {
                    tmp.environment_id = undefined;
                  }
                  setResourceData(tmp);
                }}
              />
            </Column>
            {/*Assistant Transfer Nodes*/}
            <Column
              className="selectColumnResource"
              sm={4}
              md={8}
              lg={16}
              xlg={16}
            >
              <MultiSelect
                disabled={disableAllInputs}
                className="multiselect"
                titleText="Nós de transferência"
                onChange={(e) => {
                  const tmp = { ...resourceData };
                  tmp.assistantMetadata.transferNode = [...e.selectedItems];
                  setResourceData(tmp);
                }}
                itemToString={(item) => (item ? item : "")}
                items={
                  skillJson?.workspace?.actions
                    ? skillJson?.workspace?.actions.map(
                        (action) => action.title
                      )
                    : []
                }
                label={
                  disableAllInputs
                    ? "Using Manual Input"
                    : skillJson
                    ? resourceData?.assistantMetadata.transferNode.length > 0
                      ? resourceData?.assistantMetadata.transferNode.join("; ")
                      : "Selecione uma ou mais Actions"
                    : "Faça upload de um arquivo"
                }
                size="md"
              />
            </Column>
            {/*Assistant Feedback Nodes*/}
            <Column
              className="selectColumnResource"
              sm={4}
              md={8}
              lg={16}
              xlg={16}
            >
              <MultiSelect
                disabled={disableAllInputs}
                className="multiselect"
                titleText="Nós de feedback"
                onChange={(e) => {
                  const tmp = { ...resourceData };
                  tmp.assistantMetadata.feedbackNode = [...e.selectedItems];
                  setResourceData(tmp);
                }}
                itemToString={(item) => (item ? item : "")}
                items={
                  skillJson?.workspace?.actions
                    ? skillJson?.workspace?.actions.map(
                        (action) => action.title
                      )
                    : []
                }
                label={
                  disableAllInputs
                    ? "Using Manual Input"
                    : skillJson
                    ? resourceData?.assistantMetadata.feedbackNode.length > 0
                      ? resourceData?.assistantMetadata.feedbackNode.join("; ")
                      : "Selecione uma ou mais Actions"
                    : "Faça upload de um arquivo"
                }
                size="md"
              />
            </Column>
            {/*Assistant Final Node*/}
            <Column
              className="selectColumnResource"
              sm={4}
              md={8}
              lg={16}
              xlg={16}
            >
              <MultiSelect
                disabled={disableAllInputs}
                className="multiselect"
                titleText="Nós Finais"
                onChange={(e) => {
                  const tmp = { ...resourceData };
                  tmp.assistantMetadata.finalNode = [...e.selectedItems];
                  setResourceData(tmp);
                }}
                itemToString={(item) => (item ? item : "")}
                items={
                  skillJson?.workspace?.actions
                    ? skillJson?.workspace?.actions.map(
                        (action) => action.title
                      )
                    : []
                }
                label={
                  disableAllInputs
                    ? "Using Manual Input"
                    : skillJson
                    ? resourceData?.assistantMetadata.finalNode.length > 0
                      ? resourceData?.assistantMetadata.finalNode.join("; ")
                      : "Selecione uma ou mais Actions"
                    : "Faça upload de um arquivo"
                }
                size="md"
              />
            </Column>
            {/*Assistant Relevant Topics*/}
            <Column
              className="selectColumnResource"
              sm={4}
              md={8}
              lg={16}
              xlg={16}
            >
              <MultiSelect
                disabled={disableAllInputs}
                className="multiselect"
                titleText="Tópicos Relevantes"
                onChange={(e) => {
                  const tmp = { ...resourceData };
                  tmp.assistantMetadata.relevantTopics = [...e.selectedItems];
                  setResourceData(tmp);
                }}
                itemToString={(item) => (item ? item : "")}
                items={
                  skillJson?.workspace?.actions
                    ? skillJson?.workspace?.actions.map(
                        (action) => action.title
                      )
                    : []
                }
                label={
                  disableAllInputs
                    ? "Using Manual Input"
                    : skillJson
                    ? resourceData?.assistantMetadata.relevantTopics.length > 0
                      ? resourceData?.assistantMetadata.relevantTopics.join(
                          "; "
                        )
                      : "Selecione uma ou mais Actions"
                    : "Faça upload de um arquivo"
                }
                size="md"
              />
            </Column>
          </Grid>
        </ModalBody>
        <ModalFooter>
          <Button
            disabled={disableAllInputs}
            kind="secondary"
            onClick={async () => {
              clearMultiSelects();
              setSkillJson(null);
              setDisableInput(false);
              setOpenActionInputModal(false);
              setLoading(true);

              if (resourceData.assistant)
                setResponseAssistants(
                  await getAssistants(resourceData.assistant)
                );
              setLoading(false);
            }}
          >
            Cancelar
          </Button>
          <Button
            kind="primary"
            onClick={() => {
              setOpenActionInputModal(false);
            }}
          >
            Continuar
          </Button>
        </ModalFooter>
      </ComposedModal>
    </>
  );
}
