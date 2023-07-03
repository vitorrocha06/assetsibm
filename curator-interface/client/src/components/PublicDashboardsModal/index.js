import React, { useState, useEffect } from "react";
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
  Select,
  SelectItem,
  Accordion,
  AccordionItem,
} from "@carbon/react";

import "./style.scss";
import { useGlobalState } from "../../hooks/globalState";
import {
  deleteDashboard,
  getPublicDashbords,
  sendToCloudant,
} from "../../helpers/cloudantApiCalls";
import { useParams } from "react-router-dom";
import { TrashCan } from "@carbon/icons-react";

export function PublicDashboardsModal({
  currentDashboard,
  setCurrentDashboard,
}) {
  const { language } = useParams();
  const {
    setLoading,
    publicDashboardsModalOpen,
    setPublicDashboardsModalOpen,
    publicDashboards,
    setPublicDashboards,
  } = useGlobalState();

  const [dashboardName, setDashboardName] = useState("");
  const [dashboardId, setDashboardId] = useState("");

  useEffect(() => {
    saveDashboardsToState();
  }, []);

  useEffect(() => {
    setDashboardId(dashboardName.replace(/[^a-zA-Z]/g, ""));
  }, [dashboardName]);

  async function saveDashboardsToState() {
    setPublicDashboards(await getPublicDashbords());
  }

  return (
    <ComposedModal
      size="lg"
      open={publicDashboardsModalOpen}
      onRequestClose={() => {
        setPublicDashboardsModalOpen(false);
      }}
      onClose={() => {
        setPublicDashboardsModalOpen(false);
      }}
      preventCloseOnClickOutside={true}
    >
      <ModalHeader label="Compartilharmento de Dashboards">
        <p style={{ textAlign: "justify" }}>
          Veja abaixo os dashboards com visualização pública. Para gerar um link
          compartilhável deste atual dashboard, utilize o botão "Criar novo".
        </p>
      </ModalHeader>
      <ModalBody style={{ overflow: "scroll" }}>
        <Grid>
          <Column className="modalColumn" sm={4} md={8} lg={16} xlg={16}>
            <Accordion className={"publicDashboardsAccordion"}>
              {publicDashboards.length > 0 ? (
                publicDashboards.map((publicDashboard, index) => (
                  <AccordionItem
                    key={`publicDashboard-${publicDashboard.id}`}
                    title={publicDashboard.id}
                  >
                    <div className="dashboardAccordionContent">
                      <a
                        href={`/${language}/view/${publicDashboard.id}/`}
                        target="_blank"
                      >
                        Abrir visualização pública
                      </a>
                      <Button
                        kind="danger"
                        renderIcon={TrashCan}
                        onClick={async () => {
                          setLoading(true);
                          const tmp = [...publicDashboards];
                          tmp.splice(
                            tmp.findIndex(
                              (dash) => dash.id === publicDashboard.id
                            ),
                            1
                          );
                          await deleteDashboard(publicDashboard);
                          setPublicDashboards(tmp);
                          setLoading(false);
                        }}
                      >
                        Excluir
                      </Button>
                    </div>
                  </AccordionItem>
                ))
              ) : (
                <AccordionItem
                  disabled={true}
                  key={`empty-publicDashboards`}
                  title={`Não há dashboards cadastrados...`}
                ></AccordionItem>
              )}
            </Accordion>
          </Column>
          <Column className="modalColumn" sm={4} md={4} lg={8} xlg={8}>
            <TextInput
              value={dashboardName ?? ""}
              id="nameInput"
              labelText="Nome do Dashboard"
              onChange={(e) => {
                setDashboardName(e.target.value);
                setInfo(clone);
              }}
            />
          </Column>
          <Column className="modalColumn" sm={4} md={4} lg={8} xlg={8}>
            <TextInput
              disabled={true}
              value={dashboardId}
              id="idInput"
              labelText="ID final"
            />
          </Column>
        </Grid>
      </ModalBody>
      <ModalFooter>
        <Button
          kind="secondary"
          onClick={async () => {
            setPublicDashboardsModalOpen(false);
          }}
        >
          Cancelar
        </Button>
        <Button
          disabled={dashboardName.length == 0}
          kind="primary"
          onClick={async () => {
            setLoading(true);
            const dashTmp = { ...currentDashboard };
            dashTmp.id = dashboardId;
            const tmp = [...publicDashboards];
            await sendToCloudant(dashboardId, null, null, dashTmp, true);
            const index = tmp.findIndex((dash) => dash.id === dashboardId);
            if (index === -1) {
              tmp.push(dashTmp);
            } else {
              tmp[index] = dashTmp;
            }
            setPublicDashboards(tmp);
            setCurrentDashboard(dashTmp);
            setLoading(false);
          }}
        >
          Criar novo
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
}
