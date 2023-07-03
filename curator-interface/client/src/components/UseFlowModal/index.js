import {
  ComposedModal,
  ModalHeader,
  ModalFooter,
  Button,
  ModalBody,
  ProgressStep,
  ProgressIndicator,
} from "@carbon/react";

import { useState } from "react";

import step1 from "./imgs/step1.png";
import step2 from "./imgs/step2.png";
import step3 from "./imgs/step3.png";
import step4 from "./imgs/step4.png";
import step5 from "./imgs/step5.png";

import "./style.scss";

const pages = [
  {
    img: step1,
    text: "Analise a qualidade de treinamento das intents de seu Assistente, verificando a precisão geral e detalhada do mesmo, levantando possíveis causas de erro.",
  },
  {
    img: step2,
    text: "Acesse sua instância do Watson Assistant e busque pela skill do assistente em questão. Iremos editar as intents que foram identificadas como insatisfatórias.",
  },
  {
    img: step3,
    text: "Edite exemplos das intenções com baixa precisão, removendo aqueles que foram identificados como causadores de confusão. Verifique se é necessário criar novas intents ou excluir alguma existente.",
  },
  {
    img: step4,
    text: "Conhecendo suas intents, você pode agora ver como elas performam em situações de conversação real na aba Intent Search. Realize buscas através de filtros por data.",
  },
  {
    img: step5,
    text: "Gere visualizações gráficas sobre a performance histórica de seu assistente na aba Conversation Performance. Adapte os gráficos padrão para o seu caso de uso.",
  },
];

export function UseFlowModal({ openModal, setOpenModal }) {
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <ComposedModal
      size="lg"
      open={openModal}
      onRequestClose={() => {
        setOpenModal(false);
      }}
      onClose={() => {
        setOpenModal(false);
      }}
    >
      <ModalHeader
        label="Fluxo de uso"
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          padding: "16px",
        }}
      >
        <ProgressIndicator
          currentIndex={currentPage}
          style={{
            width: "100%",
            margin: "1rem",
            display: "flex",
            justifyContent: "center",
            overflow: "scroll",
          }}
        >
          <ProgressStep
            current={currentPage == 0}
            complete={currentPage > 0}
            label="Intent Train"
          />
          <ProgressStep
            current={currentPage == 1}
            complete={currentPage > 1}
            label="Access WA"
          />
          <ProgressStep
            current={currentPage == 2}
            complete={currentPage > 2}
            label="Edit intents"
          />
          <ProgressStep
            current={currentPage == 3}
            complete={currentPage > 3}
            label="Intent Search"
          />
          <ProgressStep
            current={currentPage == 4}
            complete={currentPage == 4}
            label="Performance"
            description="Step 5: Getting started with Carbon Design System"
          />
        </ProgressIndicator>
      </ModalHeader>
      <ModalBody id="modalBody">
        <div
          style={{
            height: "100%",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <p
            style={{
              minHeight: "20%",
              width: "100%",
              objectFit: "cover",
              paddingRight: "2rem",
              paddingLeft: "2rem",
            }}
          >
            {pages[currentPage].text}
          </p>
          <img
            src={pages[currentPage].img}
            style={{
              width: "100%",
              height: "80%",
              overflow: "scroll",
              objectFit: "contain",
              paddingTop: "-10px",
            }}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          disabled={currentPage == 0}
          kind="secondary"
          onClick={async () => {
            setCurrentPage(currentPage - 1);
          }}
        >
          Anterior
        </Button>
        <Button
          disabled={currentPage == pages.length - 1}
          kind="primary"
          onClick={async () => {
            setCurrentPage(currentPage + 1);
          }}
        >
          Próximo
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
}
