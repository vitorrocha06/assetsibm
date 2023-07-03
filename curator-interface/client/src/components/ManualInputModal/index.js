import { useEffect, useState } from "react";
import {
  ComposedModal,
  ModalHeader,
  ModalFooter,
  Button,
  ModalBody,
  TextInput,
  Grid,
  Column,
  Select,
  SelectItem,
} from "@carbon/react";

import { useGlobalState } from "../../hooks/globalState";

export function ManualInputModal({ data, setData }) {
  const {
    openManualInputModal,
    setOpenManualInputModal,
    setLoading,
    disableAllInputs,
    setDisableAllInputs,
  } = useGlobalState();

  const [actionAssistant, setActionAssistant] = useState(false);

  return (
    <ComposedModal
      size="lg"
      open={openManualInputModal}
      onRequestClose={() => {
        setOpenManualInputModal(false);
      }}
      onClose={() => {
        setOpenManualInputModal(false);
      }}
      preventCloseOnClickOutside={true}
      hasScrollingContent
    >
      <ModalHeader label="Cadastro de novo Assistant (Actions)">
        <p style={{ textAlign: "justify" }}>
          Utilize os inputs abaixo para manualmente inserir as instâncias que
          deseja cadastrar no assistant curator.
        </p>
      </ModalHeader>
      <ModalBody>
        <Grid narrow>
          <Column
            className="selectColumnResource"
            sm={4}
            md={8}
            lg={16}
            xlg={16}
          >
            <TextInput
              labelText="IBM Account ID"
              value={data.accountId ?? ""}
              onChange={(e) => {
                const tmp = { ...data };
                if (e.target.value) {
                  tmp.accountId = e.target.value;
                } else {
                  tmp.accountId = null;
                }
                setData(tmp);
              }}
            />
          </Column>
          <Column className="selectColumnResource" sm={4} md={8} lg={8} xlg={8}>
            <TextInput
              labelText="Watson Assistant Instance GUID"
              value={data.assistant ?? ""}
              onChange={(e) => {
                const tmp = { ...data };
                if (e.target.value) {
                  tmp.assistant = e.target.value;
                } else {
                  tmp.assistant = null;
                }
                setData(tmp);
              }}
            />
          </Column>
          <Column className="selectColumnResource" sm={4} md={8} lg={8} xlg={8}>
            <TextInput
              labelText="Skill Name"
              value={data.skill_name ?? ""}
              onChange={(e) => {
                const tmp = { ...data };
                if (e.target.value) {
                  tmp.skill_name = e.target.value;
                } else {
                  tmp.skill_name = null;
                }
                setData(tmp);
              }}
            />
          </Column>
          <Column className="selectColumnResource" sm={4} md={8} lg={8} xlg={8}>
            <Select
              labelText="Tipo de Assistant"
              defaultValue={"placeholder-item"}
              id="select-1"
              onChange={(e) => {
                const tmp = { ...data };
                if (e.target.value === "true") {
                  setActionAssistant(true);
                  tmp.actions = true;
                } else {
                  setActionAssistant(false);
                  tmp.actions = false;
                  tmp.environment_id = undefined;
                  tmp.assistant_id = undefined;
                }
                setData(tmp);
              }}
            >
              <SelectItem
                key={`selectItem-assistantActions`}
                text={"Actions"}
                value={true}
              />
              <SelectItem
                key={`selectItem-assistantDialog`}
                text={"Dialog"}
                value={false}
              />
              <SelectItem
                hidden
                text={"Selecione o tipo de assistente"}
                value="placeholder-item"
              />
            </Select>
          </Column>
          <Column className="selectColumnResource" sm={4} md={8} lg={8} xlg={8}>
            <TextInput
              labelText="Skill ID (Workspace ID)"
              value={data.workspace_id ?? ""}
              onChange={(e) => {
                const tmp = { ...data };
                if (e.target.value) {
                  tmp.workspace_id = e.target.value;
                } else {
                  tmp.workspace_id = null;
                }
                setData(tmp);
              }}
            />
          </Column>
          <Column className="selectColumnResource" sm={4} md={8} lg={8} xlg={8}>
            <TextInput
              labelText="Environment ID"
              disabled={!actionAssistant}
              value={
                actionAssistant
                  ? data.environment_id ?? ""
                  : "Only for action Assistants"
              }
              onChange={(e) => {
                const tmp = { ...data };
                if (e.target.value) {
                  tmp.environment_id = e.target.value;
                } else {
                  tmp.environment_id = null;
                }
                setData(tmp);
              }}
            />
          </Column>
          <Column className="selectColumnResource" sm={4} md={8} lg={8} xlg={8}>
            <TextInput
              labelText="Assistant ID"
              disabled={!actionAssistant}
              value={
                actionAssistant
                  ? data.assistant_id ?? ""
                  : "Only for action Assistants"
              }
              onChange={(e) => {
                const tmp = { ...data };
                if (e.target.value) {
                  tmp.assistant_id = e.target.value;
                } else {
                  tmp.assistant_id = undefined;
                }
                setData(tmp);
              }}
            />
          </Column>
          <Column className="selectColumnResource" sm={4} md={8} lg={8} xlg={8}>
            <TextInput
              labelText="Db2 GUID"
              value={data.db2 ?? ""}
              onChange={(e) => {
                const tmp = { ...data };
                if (e.target.value) {
                  tmp.db2 = e.target.value;
                } else {
                  tmp.db2 = null;
                }
                setData(tmp);
              }}
            />
          </Column>
          <Column className="selectColumnResource" sm={4} md={8} lg={8} xlg={8}>
            <TextInput
              labelText="Cognos GUID"
              value={data.cognos ?? ""}
              onChange={(e) => {
                const tmp = { ...data };
                if (e.target.value) {
                  tmp.cognos = e.target.value;
                } else {
                  tmp.cognos = null;
                }
                setData(tmp);
              }}
            />
          </Column>
          <Column className="selectColumnResource" sm={4} md={8} lg={8} xlg={8}>
            <TextInput
              labelText="Cloudant GUID"
              value={data.cloudant ?? ""}
              onChange={(e) => {
                const tmp = { ...data };
                if (e.target.value) {
                  tmp.cloudant = e.target.value;
                } else {
                  tmp.cloudant = null;
                }
                setData(tmp);
              }}
            />
          </Column>
          <Column className="selectColumnResource" sm={4} md={8} lg={8} xlg={8}>
            <TextInput
              labelText="NLU GUID"
              value={data.nlu ?? ""}
              onChange={(e) => {
                const tmp = { ...data };
                if (e.target.value) {
                  tmp.nlu = e.target.value;
                } else {
                  tmp.nlu = null;
                }
                setData(tmp);
              }}
            />
          </Column>
          <Column className="selectColumnResource" sm={4} md={8} lg={8} xlg={8}>
            <TextInput
              labelText="COS GUID"
              value={data.cos ?? ""}
              onChange={(e) => {
                const tmp = { ...data };
                if (e.target.value) {
                  tmp.cos = e.target.value;
                } else {
                  tmp.cos = null;
                }
                setData(tmp);
              }}
            />
          </Column>
          <Column className="selectColumnResource" sm={4} md={8} lg={8} xlg={8}>
            <TextInput
              labelText="COS Bucket Name"
              value={data.cosBucket ?? ""}
              onChange={(e) => {
                const tmp = { ...data };
                if (e.target.value) {
                  tmp.cosBucket = e.target.value;
                } else {
                  tmp.cosBucket = null;
                }
                setData(tmp);
              }}
            />
          </Column>
          <Column
            className="selectColumnResource"
            sm={4}
            md={8}
            lg={16}
            xlg={16}
          >
            <Select
              labelText="Periodicity"
              defaultValue="placeholder-item"
              id="select-periodicity-manualInputModal"
              onChange={(e) => {
                const tmp = { ...data };
                tmp.periodicity = e.target.value;
                setData(tmp);
              }}
              size="md"
            >
              <SelectItem
                hidden
                text={"Choose an option"}
                value="placeholder-item"
              />
              <SelectItem text="Every min" value={"* * * * *"} />
              <SelectItem text="Every 5 min" value={"*/5 * * * *"} />
              <SelectItem text="Every 10 min" value={"*/10 * * * *"} />
              <SelectItem text="Every hour" value={"0 * * * *"} />
              <SelectItem text="Every 5 hours" value={"0 */5 * * *"} />
              <SelectItem text="Every 12 hours" value={"0 */12 * * *"} />
              <SelectItem text="Once a day" value={"0 0 * * *"} />
            </Select>
          </Column>
        </Grid>
      </ModalBody>
      <ModalFooter>
        <Button
          kind="secondary"
          onClick={async () => {
            setDisableAllInputs(false);
            setData({
              assistant: null,
              actions: data.actions,
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
              periodicity: data.periodicity,
            });
            setOpenManualInputModal(false);
          }}
        >
          Cancelar
        </Button>
        <Button
          disabled={
            data.actions
              ? !Object.entries(data).every(([key, value]) => {
                  return value != null || value != undefined;
                })
              : !Object.entries(data).every(([key, value]) => {
                  if (key != "assistant_id" && key != "environment_id")
                    return value != null;
                  else return true;
                })
          }
          kind="primary"
          onClick={() => {
            setDisableAllInputs(true);
            setOpenManualInputModal(false);
          }}
        >
          Salvar
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
}
