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
import { height } from "@mui/system";

export default function FirstSteps() {
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
        <Column sm={4} md={8} lg={16} xlg={16} style={{ marginBottom: "1rem" }}>
          <Tile
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "justify",
            }}
          >
            <h3
              style={{
                padding: "1rem",
                fontWeight: "lighter",
              }}
            >
              Não foi identificado nenhum Assistente disponível para sua
              curadoria.
            </h3>
          </Tile>
        </Column>
        <Column sm={4} md={8} lg={16} xlg={16}>
          <Stack gap={5}>
            <Tile
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "justify",
              }}
            >
              <h3
                style={{
                  padding: "1rem",
                  fontWeight: "lighter",
                }}
              >
                Faça o cadastro de um assistente na tela Assistant Registration,
                disponível no menu lateral.
              </h3>
            </Tile>
          </Stack>
        </Column>
      </Grid>
    </Theme>
  );
}
