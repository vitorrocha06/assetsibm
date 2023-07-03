import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useGlobalState } from "../../hooks/globalState";
import texts from "../../helpers/languagesConfig";
import { useNavigate, useParams } from "react-router-dom";
import {
  Column,
  Theme,
  Grid,
  Button,
  TextInput,
  Stack,
  Select,
  SelectItem,
  Loading,
  Tile,
  SelectItemGroup,
  TileGroup,
  MultiSelect,
} from "@carbon/react";

import "./style.scss";
import {
  getAllKeys,
  getAssistantDetails,
  getAssistants,
  getAvailableWorkspaces,
  getCOSBuckets,
  queryAllResources,
} from "../../helpers/resourcesApiCalls";
import api from "../../services/api";
import { groupBy, organizeByAccount } from "../../helpers/misc";
import { Notification } from "../../components/Notification";
import { ActionInputModal } from "../../components/ActionInputModal";
import { AccountModal } from "../../components/AccountModal";
import { ManualInputModal } from "../../components/ManualInputModal";

export default function NewAssistantForm() {
  const navigate = useNavigate();
  const { language } = useParams();
  const {
    lightMode,
    resources,
    setResources,
    loading,
    setLoading,
    assistants,
    setAssistants,
    disableAllInputs,
  } = useGlobalState();

  const [resourceData, setResourceData] = useState({
    assistant: null,
    actions: null,
    assistant_id: null,
    environment_id: undefined,
    workspace_id: null,
    assistantMetadata: {
      transferNode: [],
      feedbackNode: [],
      relevantTopics: [],
      finalNode: [],
    },
    skill_name: null,
    accountId: null,
    db2: null,
    cognos: null,
    cloudant: null,
    nlu: null,
    cos: null,
    cosBucket: null,
    periodicity: null,
  });
  const [manualData, setManualData] = useState({
    assistant: null,
    actions: null,
    assistant_id: null,
    environment_id: undefined,
    workspace_id: null,
    assistantMetadata: {
      transferNode: [],
      feedbackNode: [],
      relevantTopics: [],
      finalNode: [],
    },
    skill_name: null,
    accountId: null,
    db2: null,
    cognos: null,
    cloudant: null,
    nlu: null,
    cos: null,
    cosBucket: null,
    periodicity: null,
  });

  const [skillJson, setSkillJson] = useState(null);
  const [preSelected, setPreSelected] = useState({});
  const [responseAssistants, setResponseAssistants] = useState(null);
  const [assistantDetails, setAssistantDetails] = useState(null);
  const [cosBuckets, setCosBuckets] = useState(null);

  const [showNotification, setShowNotification] = useState(false);
  const [notificationContent, setNotificationContent] = useState({
    title: "Assistant ID",
    text: `Caso o assistente desejado não conste na lista de assistentes existentes nesta instância do WA, insira sua skill manualmente através do modal disponível na engrenagem.`,
    kind: "info",
  });

  const [disableInput, setDisableInput] = useState(false);

  useEffect(() => {
    if (resources)
      setResources(
        Object.entries(resources).reduce((acc, [service, resources]) => {
          if (preSelected[service])
            acc[service] = (acc[service] || [])
              .concat(preSelected[service])
              .filter(
                (value, index, self) =>
                  index === self.findIndex((t) => t.guid === value.guid)
              );
          return acc;
        }, resources)
      );
  }, [resources]);

  useEffect(() => {
    console.log(resourceData);
    if (resources) {
      setPreSelected(
        Object.entries(resources).reduce((acc, [service, resources]) => {
          acc[service] = (acc[service] || []).concat(
            resources.filter((resource) =>
              Object.values(resourceData).includes(resource.guid)
            )
          );

          return acc;
        }, {})
      );
    }
  }, [resourceData]);

  useEffect(() => {
    console.log(preSelected);
  }, [preSelected]);

  function clearMultiSelects() {
    const multiselectElements = document.getElementsByClassName(
      "cds--tag__close-icon"
    );
    for (let element of multiselectElements) {
      element.click();
    }
  }

  return (
    <Theme theme={lightMode ? "white" : "g100"}>
      <Header />
      <div className="content">
        {loading ? <Loading /> : ""}
        <Grid narrow>
          <Column sm={4} md={8} lg={16} xlg={16}>
            <h1 style={{ paddingTop: "10px", paddingBottom: "10px" }}>
              Assistentes
            </h1>
          </Column>
          <Column sm={4} md={8} lg={16} xlg={16}>
            <Grid narrow>
              <Column
                sm={4}
                md={8}
                lg={4}
                xlg={4}
                style={{ marginBottom: "0.5rem" }}
              >
                <Tile style={{ maxHeight: "80vh", overflow: "scroll" }}>
                  <Stack>
                    <Tile>
                      <h2>Já cadastrados:</h2>
                    </Tile>
                    {assistants?.map((assistant) => (
                      <Tile>
                        <h4>{assistant.SKILL_NAME}</h4>
                      </Tile>
                    ))}
                  </Stack>
                </Tile>
              </Column>
              <Column sm={4} md={8} lg={12} xlg={12}>
                <Grid narrow>
                  {/*WA Instance*/}
                  <Column
                    className="selectColumnResource"
                    sm={4}
                    md={8}
                    lg={16}
                    xlg={16}
                  >
                    <Select
                      disabled={disableAllInputs}
                      defaultValue="placeholder-item"
                      id="select-1"
                      labelText="Watson Assistant Instance"
                      onChange={async (e) => {
                        const value = JSON.parse(e.target.value);
                        const tmp = { ...resourceData };
                        if (!disableInput) {
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
                        }
                        tmp.accountId = value.accountId;
                        tmp.assistant = value.guid;
                        clearMultiSelects();
                        setResourceData(tmp);
                        setLoading(true);
                        setAssistantDetails(null);
                        setResponseAssistants(null);
                        setResponseAssistants(await getAssistants(value.guid));
                        setLoading(false);
                        setNotificationContent({
                          title: "Assistant ID",
                          text: `Caso o assistente desejado não conste na lista de assistentes existentes nesta instância do WA, insira sua skill manualmente através do modal disponível na engrenagem.`,
                          kind: "info",
                        });
                        setShowNotification(true);
                      }}
                      size="md"
                    >
                      {resources?.assistant ? (
                        Object.entries(groupBy(resources?.assistant)).map(
                          ([account, assistants]) => {
                            return (
                              <SelectItemGroup label={account}>
                                {assistants.map((assistant, index) => {
                                  return (
                                    <SelectItem
                                      key={`selectItem-${assistant.name}`}
                                      text={
                                        disableAllInputs
                                          ? " Using Manual Input"
                                          : assistant.name
                                      }
                                      value={JSON.stringify({
                                        accountId: assistant.account_id,
                                        guid: assistant.guid,
                                      })}
                                    />
                                  );
                                })}
                              </SelectItemGroup>
                            );
                          }
                        )
                      ) : (
                        <SelectItem
                          hidden
                          text="Login to see available Assistants"
                          value="placeholder-item"
                        />
                      )}
                      <SelectItem
                        hidden
                        text={
                          disableAllInputs
                            ? "Using Manual Input"
                            : preSelected?.assistant &&
                              preSelected?.assistant.length > 0
                            ? preSelected?.assistant[0]?.name
                            : "Choose an option"
                        }
                        value="placeholder-item"
                      />
                    </Select>
                  </Column>
                  {/*Assistant*/}
                  <Column
                    className="selectColumnResource"
                    sm={4}
                    md={8}
                    lg={6}
                    xlg={6}
                  >
                    <Select
                      disabled={disableInput || disableAllInputs}
                      defaultValue={"placeholder-item"}
                      id="select-1"
                      labelText="Assistant"
                      onChange={async (e) => {
                        const value = JSON.parse(e.target.value);
                        const tmp = { ...resourceData };
                        tmp.actions = value.actions;
                        tmp.assistant_id = value.assistant_id;
                        tmp.workspace_id = value.workspace_id;
                        tmp.environment_id = value.actions ? null : undefined;
                        tmp.skill_name = value.skill_name;
                        tmp.assistantMetadata = {
                          transferNode: [],
                          feedbackNode: [],
                          relevantTopics: [],
                          finalNode: [],
                        };
                        clearMultiSelects();
                        setLoading(true);
                        setAssistantDetails(null);
                        setAssistantDetails(
                          await getAssistantDetails(
                            value.workspace_id,
                            tmp.assistant
                          )
                        );
                        setLoading(false);
                        setResourceData(tmp);
                      }}
                      size="md"
                    >
                      {responseAssistants ? (
                        responseAssistants.map((assistant, index) => (
                          <SelectItem
                            key={`${assistant.workspace_id}-${assistant.workspace_id}`}
                            text={
                              disableInput || disableAllInputs
                                ? "Using Manual Input"
                                : assistant.name
                            }
                            value={JSON.stringify({
                              actions: assistant.actions ?? false,
                              assistant_id: assistant.assistant_id,
                              workspace_id: assistant.workspace_id,
                              skill_name: assistant.name,
                            })}
                          />
                        ))
                      ) : (
                        <SelectItem
                          hidden
                          text={
                            disableInput || disableAllInputs
                              ? "Using Manual Input"
                              : "Select an instance to see available Assistants"
                          }
                          value="placeholder-item"
                        />
                      )}
                      <SelectItem
                        hidden
                        text={
                          disableInput || disableAllInputs
                            ? "Using Manual Input"
                            : "Choose an option"
                        }
                        value="placeholder-item"
                      />
                    </Select>
                  </Column>
                  {/*Assistant Environments*/}
                  <Column
                    className="selectColumnResource"
                    sm={4}
                    md={8}
                    lg={6}
                    xlg={6}
                  >
                    <Select
                      disabled={
                        disableAllInputs
                          ? true
                          : disableInput || !resourceData.actions
                      }
                      defaultValue="placeholder-item"
                      id="select-1"
                      labelText="Environment ID (Only for action Assistants)"
                      onChange={async (e) => {
                        const value = e.target.value;
                        const tmp = { ...resourceData };
                        tmp.environment_id = value;
                        setResourceData(tmp);
                      }}
                      size="md"
                    >
                      {responseAssistants ? (
                        responseAssistants
                          .find(
                            (assistant) =>
                              assistant.assistant_id ===
                              resourceData.assistant_id
                          )
                          ?.assistant_environments?.map(
                            (environment, index) => (
                              <SelectItem
                                key={`${environment.environment_id}-${index}`}
                                text={
                                  disableInput || disableAllInputs
                                    ? "Using Manual Input"
                                    : environment.name
                                }
                                value={environment.environment_id}
                              />
                            )
                          )
                      ) : (
                        <SelectItem
                          hidden
                          text={
                            disableInput || disableAllInputs
                              ? "Using Manual Input"
                              : "Select an action Assistant to see available environments"
                          }
                          value="placeholder-item"
                        />
                      )}
                      <SelectItem
                        hidden
                        text={
                          disableInput || disableAllInputs
                            ? "Using Manual Input"
                            : resourceData.actions
                            ? "Choose an option"
                            : "Only for action Assistants"
                        }
                        value="placeholder-item"
                      />
                    </Select>
                  </Column>
                  {/*Assistant Transfer Nodes*/}
                  <Column
                    className="selectColumnResource"
                    sm={4}
                    md={8}
                    lg={6}
                    xlg={6}
                  >
                    <MultiSelect
                      disabled={disableInput || disableAllInputs}
                      className="multiselect"
                      titleText="Nós de transferência"
                      onChange={(e) => {
                        const tmp = { ...resourceData };
                        tmp.assistantMetadata.transferNode = [
                          ...e.selectedItems,
                        ];
                        setResourceData(tmp);
                      }}
                      itemToString={(item) => (item ? item : "")}
                      items={
                        assistantDetails
                          ? assistantDetails?.dialog_nodes.map(
                              (node) => node.dialog_node
                            )
                          : []
                      }
                      label={
                        disableInput || disableAllInputs
                          ? "Using Manual Input"
                          : resourceData.workspace_id
                          ? resourceData?.assistantMetadata.transferNode
                              .length > 0
                            ? resourceData?.assistantMetadata.transferNode.join(
                                "; "
                              )
                            : "Select one or more nodes"
                          : "Select an Assistant"
                      }
                      size="md"
                    />
                  </Column>
                  {/*Assistant Feedback Nodes*/}
                  <Column
                    className="selectColumnResource"
                    sm={4}
                    md={8}
                    lg={6}
                    xlg={6}
                  >
                    <MultiSelect
                      disabled={disableInput || disableAllInputs}
                      className="multiselect"
                      titleText="Nós de feedback"
                      onChange={(e) => {
                        const tmp = { ...resourceData };
                        tmp.assistantMetadata.feedbackNode = [
                          ...e.selectedItems,
                        ];
                        setResourceData(tmp);
                      }}
                      itemToString={(item) => (item ? item : "")}
                      items={
                        assistantDetails
                          ? assistantDetails?.dialog_nodes.map(
                              (node) => node.dialog_node
                            )
                          : []
                      }
                      label={
                        disableInput || disableAllInputs
                          ? "Using Manual Input"
                          : resourceData.workspace_id
                          ? resourceData?.assistantMetadata.feedbackNode
                              .length > 0
                            ? resourceData?.assistantMetadata.feedbackNode.join(
                                "; "
                              )
                            : "Select one or more nodes"
                          : "Select an Assistant"
                      }
                      size="md"
                    />
                  </Column>
                  {/*Assistant Final Node*/}
                  <Column
                    className="selectColumnResource"
                    sm={4}
                    md={8}
                    lg={6}
                    xlg={6}
                  >
                    <MultiSelect
                      disabled={disableInput || disableAllInputs}
                      className="multiselect"
                      titleText="Nós Finais"
                      onChange={(e) => {
                        const tmp = { ...resourceData };
                        tmp.assistantMetadata.finalNode = [...e.selectedItems];
                        setResourceData(tmp);
                      }}
                      itemToString={(item) => (item ? item : "")}
                      items={
                        assistantDetails
                          ? assistantDetails?.dialog_nodes.map(
                              (node) => node.dialog_node
                            )
                          : []
                      }
                      label={
                        disableInput || disableAllInputs
                          ? "Using Manual Input"
                          : resourceData.workspace_id
                          ? resourceData?.assistantMetadata.finalNode.length > 0
                            ? resourceData?.assistantMetadata.finalNode.join(
                                "; "
                              )
                            : "Select one or more nodes"
                          : "Select an Assistant"
                      }
                      size="md"
                    />
                  </Column>
                  {/*Assistant Relevant Topics*/}
                  <Column
                    className="selectColumnResource"
                    sm={4}
                    md={8}
                    lg={6}
                    xlg={6}
                  >
                    <MultiSelect
                      disabled={disableInput || disableAllInputs}
                      className="multiselect"
                      titleText="Tópicos Relevantes"
                      onChange={(e) => {
                        const tmp = { ...resourceData };
                        tmp.assistantMetadata.relevantTopics = [
                          ...e.selectedItems,
                        ];
                        setResourceData(tmp);
                      }}
                      itemToString={(item) => (item ? item : "")}
                      items={
                        assistantDetails
                          ? assistantDetails?.intents.map(
                              (intent) => intent.intent
                            )
                          : []
                      }
                      label={
                        disableInput || disableAllInputs
                          ? "Using Manual Input"
                          : resourceData.workspace_id
                          ? resourceData?.assistantMetadata.relevantTopics
                              .length > 0
                            ? resourceData?.assistantMetadata.relevantTopics.join(
                                "; "
                              )
                            : "Select one or more intents"
                          : "Select an Assistant"
                      }
                      size="md"
                    />
                  </Column>
                  {/*Db2*/}
                  <Column
                    className="selectColumnResource"
                    sm={4}
                    md={8}
                    lg={6}
                    xlg={6}
                  >
                    <Select
                      disabled={disableAllInputs}
                      defaultValue="placeholder-item"
                      id="select-1"
                      labelText="Db2"
                      onChange={(e) => {
                        const tmp = { ...resourceData };
                        tmp.db2 = e.target.value;
                        setResourceData(tmp);
                      }}
                      size="md"
                    >
                      {resources?.db2 ? (
                        organizeByAccount(resources?.db2, disableAllInputs)
                      ) : (
                        <SelectItem
                          hidden
                          text="Login to see available Db2s"
                          value="placeholder-item"
                        />
                      )}
                      <SelectItem
                        hidden
                        text={
                          disableAllInputs
                            ? "Using Manual Input"
                            : preSelected?.db2 && preSelected?.db2.length > 0
                            ? preSelected?.db2[0]?.name
                            : "Choose an option"
                        }
                        value="placeholder-item"
                      />
                    </Select>
                  </Column>
                  {/*Cognos*/}
                  <Column
                    className="selectColumnResource"
                    sm={4}
                    md={8}
                    lg={6}
                    xlg={6}
                  >
                    <Select
                      disabled={disableAllInputs}
                      defaultValue="placeholder-item"
                      id="select-1"
                      labelText="Cognos"
                      onChange={(e) => {
                        const tmp = { ...resourceData };
                        tmp.cognos = e.target.value;
                        setResourceData(tmp);
                      }}
                      size="md"
                    >
                      {resources?.cognos ? (
                        organizeByAccount(resources?.cognos, disableAllInputs)
                      ) : (
                        <SelectItem
                          hidden
                          text="Login to see available Cognos"
                          value="placeholder-item"
                        />
                      )}
                      <SelectItem
                        hidden
                        text={
                          disableAllInputs
                            ? "Using Manual Input"
                            : preSelected?.cognos &&
                              preSelected?.cognos.length > 0
                            ? preSelected?.cognos[0]?.name
                            : "Choose an option"
                        }
                        value="placeholder-item"
                      />
                    </Select>
                  </Column>
                  {/*Cloundant*/}
                  <Column
                    className="selectColumnResource"
                    sm={4}
                    md={8}
                    lg={6}
                    xlg={6}
                  >
                    <Select
                      disabled={disableAllInputs}
                      defaultValue="placeholder-item"
                      id="select-1"
                      labelText="Cloudant"
                      onChange={(e) => {
                        const tmp = { ...resourceData };
                        tmp.cloudant = e.target.value;
                        setResourceData(tmp);
                      }}
                      size="md"
                    >
                      {resources?.cloudant ? (
                        organizeByAccount(resources?.cloudant, disableAllInputs)
                      ) : (
                        <SelectItem
                          hidden
                          text="Login to see available Cloudants"
                          value="placeholder-item"
                        />
                      )}
                      <SelectItem
                        hidden
                        text={
                          disableAllInputs
                            ? "Using Manual Input"
                            : preSelected?.cloudant &&
                              preSelected?.cloudant.length > 0
                            ? preSelected?.cloudant[0]?.name
                            : "Choose an option"
                        }
                        value="placeholder-item"
                      />
                    </Select>
                  </Column>
                  {/*NLU*/}
                  <Column
                    className="selectColumnResource"
                    sm={4}
                    md={8}
                    lg={6}
                    xlg={6}
                  >
                    <Select
                      disabled={disableAllInputs}
                      defaultValue="placeholder-item"
                      id="select-1"
                      labelText="NLU"
                      onChange={(e) => {
                        const tmp = { ...resourceData };
                        tmp.nlu = e.target.value;
                        setResourceData(tmp);
                      }}
                      size="md"
                    >
                      {resources?.nlu ? (
                        organizeByAccount(resources?.nlu, disableAllInputs)
                      ) : (
                        <SelectItem
                          hidden
                          text="Login to see available NLUs"
                          value="placeholder-item"
                        />
                      )}
                      <SelectItem
                        hidden
                        text={
                          disableAllInputs
                            ? "Using Manual Input"
                            : preSelected?.nlu && preSelected?.nlu.length > 0
                            ? preSelected?.nlu[0]?.name
                            : "Choose an option"
                        }
                        value="placeholder-item"
                      />
                    </Select>
                  </Column>
                  {/*COS*/}
                  <Column
                    className="selectColumnResource"
                    sm={4}
                    md={8}
                    lg={6}
                    xlg={6}
                  >
                    <Select
                      disabled={disableAllInputs}
                      defaultValue="placeholder-item"
                      id="select-1"
                      labelText="Cloud Object Storage"
                      onChange={async (e) => {
                        const value = JSON.parse(e.target.value);
                        const tmp = { ...resourceData };
                        tmp.cos = value.guid;
                        tmp.cosBucket = null;
                        setCosBuckets(null);
                        setLoading(true);
                        setCosBuckets(
                          await getCOSBuckets(value.region, value.guid)
                        );
                        setLoading(false);
                        setResourceData(tmp);
                      }}
                      size="md"
                    >
                      {resources?.cos ? (
                        Object.entries(groupBy(resources?.cos)).map(
                          ([account, cos]) => {
                            return (
                              <SelectItemGroup label={account}>
                                {cos.map((cos) => {
                                  return (
                                    <SelectItem
                                      text={
                                        disableAllInputs
                                          ? "Using Manual Input"
                                          : cos.name
                                      }
                                      value={JSON.stringify({
                                        region: cos.region_id,
                                        guid: cos.guid,
                                      })}
                                    />
                                  );
                                })}
                              </SelectItemGroup>
                            );
                          }
                        )
                      ) : (
                        <SelectItem
                          hidden
                          text="Login to see available COS"
                          value="placeholder-item"
                        />
                      )}
                      <SelectItem
                        hidden
                        text={
                          disableAllInputs
                            ? "Using Manual Input"
                            : preSelected?.cos && preSelected?.cos.length > 0
                            ? preSelected?.cos[0]?.name
                            : "Choose an option"
                        }
                        value="placeholder-item"
                      />
                    </Select>
                  </Column>
                  {/*COS Bucket*/}
                  <Column
                    className="selectColumnResource"
                    sm={4}
                    md={8}
                    lg={6}
                    xlg={6}
                  >
                    <Select
                      disabled={disableAllInputs}
                      defaultValue="placeholder-item"
                      id="select-1"
                      labelText="COS Bucket"
                      onChange={(e) => {
                        const tmp = { ...resourceData };
                        tmp.cosBucket = e.target.value;
                        setResourceData(tmp);
                      }}
                      size="md"
                    >
                      {cosBuckets ? (
                        cosBuckets?.map((bucket) => (
                          <SelectItem
                            text={
                              disableAllInputs
                                ? "Using Manual Input"
                                : bucket.Name
                            }
                            value={bucket.Name}
                          />
                        ))
                      ) : (
                        <SelectItem
                          hidden
                          text={
                            disableAllInputs
                              ? "Using Manual Input"
                              : "Select a COS Instance"
                          }
                          value="placeholder-item"
                        />
                      )}
                      <SelectItem
                        hidden
                        text={
                          disableAllInputs
                            ? "Using Manual Input"
                            : "Choose a bucket"
                        }
                        value="placeholder-item"
                      />
                    </Select>
                  </Column>
                  {/*Periodicity*/}
                  <Column
                    className="selectColumnResource"
                    sm={4}
                    md={8}
                    lg={16}
                    xlg={16}
                  >
                    <Select
                      disabled={disableAllInputs}
                      defaultValue="placeholder-item"
                      id="select-1"
                      labelText="Periodicity"
                      onChange={(e) => {
                        const tmp = { ...resourceData };
                        tmp.periodicity = e.target.value;
                        setResourceData(tmp);
                      }}
                      size="md"
                    >
                      <SelectItem
                        hidden
                        text={
                          disableAllInputs
                            ? "Using Manual Input"
                            : "Choose an option"
                        }
                        value="placeholder-item"
                      />
                      <SelectItem
                        text={
                          disableAllInputs ? "Using Manual Input" : "Every min"
                        }
                        value={"* * * * *"}
                      />
                      <SelectItem
                        text={
                          disableAllInputs
                            ? "Using Manual Input"
                            : "Every 5 min"
                        }
                        value={"*/5 * * * *"}
                      />
                      <SelectItem
                        text={
                          disableAllInputs
                            ? "Using Manual Input"
                            : "Every 10 min"
                        }
                        value={"*/10 * * * *"}
                      />
                      <SelectItem
                        text={
                          disableAllInputs ? "Using Manual Input" : "Every hour"
                        }
                        value={"0 * * * *"}
                      />
                      <SelectItem
                        text={
                          disableAllInputs
                            ? "Using Manual Input"
                            : "Every 5 hours"
                        }
                        value={"0 */5 * * *"}
                      />
                      <SelectItem
                        text={
                          disableAllInputs
                            ? "Using Manual Input"
                            : "Every 12 hours"
                        }
                        value={"0 */12 * * *"}
                      />
                      <SelectItem
                        text={
                          disableAllInputs ? "Using Manual Input" : "Once a day"
                        }
                        value={"0 0 * * *"}
                      />
                    </Select>
                  </Column>
                  {/*Register Button*/}
                  <Column
                    className="selectColumnResource"
                    sm={4}
                    md={8}
                    lg={16}
                    xlg={16}
                  >
                    <Button
                      disabled={
                        !Object.entries(
                          disableAllInputs ? manualData : resourceData
                        ).every(([key, value]) => {
                          if (
                            key != "assistant_id" &&
                            key != "workspace_id" &&
                            key != "environment_id"
                          )
                            return value != null;
                          else return true;
                        })
                      }
                      onClick={async () => {
                        setLoading(true);
                        await getAllKeys(
                          disableAllInputs ? manualData : resourceData,
                          setLoading
                        );
                        setManualData({
                          assistant: null,
                          actions: manualData.actions,
                          assistant_id: null,
                          environment_id: undefined,
                          workspace_id: null,
                          assistantMetadata: {
                            transferNode: [],
                            feedbackNode: [],
                            relevantTopics: [],
                            finalNode: [],
                          },
                          skill_name: null,
                          accountId: null,
                          db2: null,
                          cognos: null,
                          cloudant: null,
                          nlu: null,
                          cos: null,
                          cosBucket: null,
                          periodicity: manualData.periodicity,
                        });
                        const response = await getAvailableWorkspaces();
                        console.log(
                          `Got available Workspaces. Total of ${response.length}.`
                        );
                        setAssistants(response.length > 0 ? response : null);
                        setLoading(false);
                        navigate(`/${language}/lobby`);
                      }}
                    >
                      Cadastrar
                    </Button>
                  </Column>
                </Grid>
              </Column>
            </Grid>
          </Column>
        </Grid>
      </div>
      <ActionInputModal
        resourceData={resourceData}
        setResourceData={setResourceData}
        disableAllInputs={disableAllInputs}
        setDisableInput={setDisableInput}
        setResponseAssistants={setResponseAssistants}
        setAssistantDetails={setAssistantDetails}
        setShowNotification={setShowNotification}
        setNotificationContent={setNotificationContent}
        skillJson={skillJson}
        setSkillJson={setSkillJson}
      />
      <ManualInputModal data={manualData} setData={setManualData} />
      <AccountModal />
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
