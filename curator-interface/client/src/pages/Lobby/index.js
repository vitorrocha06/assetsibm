import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Header from "../../components/Header";
import texts from "../../helpers/languagesConfig";

import {
  Theme,
  Grid,
  Column,
  Loading,
  Tile,
  Stack,
  ClickableTile,
} from "@carbon/react";
import { useGlobalState } from "../../hooks/globalState";

import "./style.scss";
import lobbyImage from "../../images/lobby.png";
import { queryAllResources } from "../../helpers/resourcesApiCalls";

export default function Dashboard() {
  const navigate = useNavigate();
  const { language } = useParams();
  const {
    lightMode,
    loading,
    setLoading,
    accounts,
    setAccounts,
    resources,
    setResources,
  } = useGlobalState();

  return (
    <Theme theme={lightMode ? "white" : "g100"}>
      <Header />
      {loading ? <Loading /> : ""}
      <Grid narrow className="content" style={{ marginTop: "3rem" }}>
        <Column
          sm={4}
          md={8}
          lg={10}
          xlg={10}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <h1>Bem-vindo ao Assistant Curator</h1>
        </Column>
        <Column
          sm={4}
          md={8}
          lg={6}
          xlg={6}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            marginBottom: "1rem",
          }}
        >
          <img
            src={lobbyImage}
            alt="login"
            width="65%"
            height="auto"
            style={{ marginBottom: "1rem" }}
          />
        </Column>
        <Column className="tilesContainer" sm={4} md={8} lg={8} xlg={8}>
          <ClickableTile onClick={() => navigate(`/${language}/train`)}>
            <h3>Qualidade de Treinamento</h3>
            <p className="pageDescription">
              Mostra gráficos baseados em dados de Experimentos realizados
              utilizando as Intenções e a árvore de conversação do Assistente.
            </p>
          </ClickableTile>
        </Column>
        <Column className="tilesContainer" sm={4} md={8} lg={8} xlg={8}>
          <ClickableTile onClick={() => navigate(`/${language}/intents`)}>
            <h3>Busca de Intenções</h3>
            <p className="pageDescription">
              Apresenta a conversa entre cliente e assistente agrupada por
              intents para avaliação humana de sua assertividade, atribuindo uma
              pontuação (1 - 5).
            </p>
          </ClickableTile>
        </Column>
        <Column className="tilesContainer" sm={4} md={8} lg={16} xlg={16}>
          <ClickableTile onClick={() => navigate(`/${language}/dashboard`)}>
            <h3>Desempenho na conversação</h3>
            <p className="pageDescription">
              Fornece uma interface para a construção e visualização de painéis
              interativos, com o IBM Cognos Dashboard, que mostra o desempenho
              do Assistente ao longo do tempo.
            </p>
          </ClickableTile>
        </Column>
      </Grid>
    </Theme>
  );
}
