import React, { useState, useEffect } from "react";
import {
  Modal,
  Grid,
  FormGroup,
  TextInput,
  Column,
  Stack,
  SelectItem,
  Select,
  DatePicker,
  DatePickerInput,
} from "@carbon/react";
import { useGlobalState } from "../../hooks/globalState";

import "./style.scss";
import { sendMail } from "../../helpers/misc";
import { emailRegex, opportunityNumberRegex } from "../../helpers/misc";

const options = [
  { text: "Prospecção", value: "Prospecção" },
  { text: "Testes", value: "Testes" },
  {
    text: "Continuidade de oportunidade já existente",
    value: "Continuidade de oportunidade já existente",
  },
  { text: "Passagem de conhecimento", value: "Passagem de conhecimento" },
];

export default function InterestModal() {
  const { interestModal, setInterestModal } = useGlobalState();

  const [readyToProceed, setReadyToProceed] = useState(false);
  const [oportunityNumberInputDisabled, setOportunityNumberInputDisabled] =
    useState(true);

  const [info, setInfo] = useState({
    asset: "assistant-curator",
    client: null,
    responsible: null,
    class: "Prospecção",
    oportunityNumber: null,
    date: new Date().toLocaleDateString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    }),
  });

  useEffect(() => {
    if (
      Object.entries(info)
        .filter(([key, value]) => key != "oportunityNumber" && key != "class")
        .every(([key, value]) => value)
    ) {
      if (
        info.responsible.match(emailRegex) &&
        (oportunityNumberInputDisabled
          ? true
          : info.oportunityNumber?.match(opportunityNumberRegex))
      ) {
        setReadyToProceed(true);
      } else setReadyToProceed(false);
    }
  }, [info]);

  async function handleSubmit() {
    await sendMail(info);
    setInterestModal(false);
    setInfo({
      asset: "assistant-curator",
      client: null,
      responsible: null,
      class: "Prospecção",
      oportunityNumber: null,
      date: new Date().toLocaleDateString("pt-BR", {
        timeZone: "America/Sao_Paulo",
      }),
    });
  }

  return (
    <>
      <Modal
        id="interestModal"
        open={interestModal}
        modalHeading={"Por gentileza preencha os campos abaixo:"}
        modalLabel={"Obrigado por utilizar uma de nossas demos!"}
        primaryButtonDisabled={!readyToProceed}
        primaryButtonText={"Enviar"}
        secondaryButtonText={"Cancelar"}
        onRequestClose={() => {
          readyToProceed
            ? setInterestModal(false)
            : alert("Por gentileza preencha todo o formulário.");
        }}
        onRequestSubmit={handleSubmit}
        preventCloseOnClickOutside
        size="lg"
      >
        <FormGroup legendId="form-group-1">
          <Grid>
            <Column sm={2} md={4} lg={8} xlg={8}>
              <TextInput
                value={info?.client ?? ""}
                id="titleInput"
                labelText="Cliente/Parceiro"
                helperText="Para qual empresa você irá apresentar?"
                onChange={(e) => {
                  const clone = { ...info };
                  clone.client = e.target.value;
                  setInfo(clone);
                }}
              />
            </Column>
            <Column sm={2} md={4} lg={8} xlg={8}>
              <TextInput
                value={info?.responsible ?? ""}
                id="authorInput"
                labelText="IBMer responsável"
                helperText="Email de contato"
                onChange={(e) => {
                  const clone = { ...info };
                  clone.responsible = e.target.value;
                  setInfo(clone);
                }}
              />
            </Column>

            <Column sm={4} md={8} lg={16} xlg={16}>
              <Select
                value={
                  options.find((option) => option.text === info?.class)?.value
                }
                id="select-1"
                labelText="Selecione"
                helperText="Classifique esta iniciativa"
                onChange={(e) => {
                  const clone = { ...info };
                  clone.class = options.find(
                    (option) => option.value == e.target.value
                  ).text;

                  if (
                    options.findIndex(
                      (option) => option.value === clone.class
                    ) >= 2
                  )
                    setOportunityNumberInputDisabled(false);
                  else {
                    clone.oportunityNumber = null;
                    setOportunityNumberInputDisabled(true);
                  }

                  setInfo(clone);
                }}
              >
                {options.map((option) => (
                  <SelectItem text={option.text} value={option.value} />
                ))}
              </Select>
            </Column>
            <Column sm={4} md={8} lg={16} xlg={16}>
              <TextInput
                value={info?.oportunityNumber ?? ""}
                maxlength={18}
                disabled={oportunityNumberInputDisabled}
                id="titleInput"
                labelText="Oportunidade"
                helperText="Número de oportunidade associado"
                onChange={(e) => {
                  const clone = { ...info };
                  clone.oportunityNumber = e.target.value;
                  setInfo(clone);
                }}
              />
            </Column>
          </Grid>
        </FormGroup>
      </Modal>
    </>
  );
}
