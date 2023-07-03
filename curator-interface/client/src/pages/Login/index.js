import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Header from "../../components/Header";
import texts from "../../helpers/languagesConfig";

import {
  Theme,
  Grid,
  Column,
  TextInput,
  Stack,
  Button,
  ButtonSet,
  Loading,
} from "@carbon/react";
import { useGlobalState } from "../../hooks/globalState";

import "./style.scss";
import loginImage from "../../images/login.png";

import api from "../../services/api";
import {
  getAssistants,
  getAvailableWorkspaces,
  queryAllResources,
} from "../../helpers/resourcesApiCalls";
import InterestModal from "../../components/InterestModal";

export default function Dashboard() {
  const { language } = useParams();
  const navigate = useNavigate();
  const { lightMode, loading, setLoading, setLogged, setAssistants } =
    useGlobalState();

  const [oneTimepassword, setOneTimepassword] = useState(null);

  return (
    <Theme theme={"g100"}>
      <Header />
      <InterestModal />
      {loading ? <Loading /> : ""}
      <Grid className="content" style={{ marginTop: "3rem" }}>
        <Column sm={4} md={8} lg={12} xlg={12}>
          <img src={loginImage} alt="login" width="94%" height="94%" />
        </Column>
        <Column sm={4} md={8} lg={4} xlg={4}>
          <Stack gap={2}>
            <h2>Login</h2>
            <TextInput
              labelText="Token"
              type="password"
              onChange={(e) => {
                setOneTimepassword(e.target.value);
              }}
            ></TextInput>
            <ButtonSet style={{ width: "50%" }}>
              <Button
                href={`${window.location.protocol}//${window.location.host}/ibmid/passcode`}
                target="_blank"
                kind="secondary"
              >
                Token
              </Button>
              <Button
                disabled={!oneTimepassword}
                onClick={async () => {
                  setLoading(true);
                  console.log("Login in...");
                  await api.post("/ibmid/login", {
                    passcode: oneTimepassword,
                  });
                  console.log("Loged. Getting Available Workspaces...");
                  setLogged(true);
                  const response = await getAvailableWorkspaces();
                  console.log(response);
                  console.log(
                    `Got available Workspaces. Total of ${response.length}.`
                  );
                  setAssistants(response.length > 0 ? response : null);
                  console.log("Done!");

                  setLoading(false);
                  navigate(`/${language}/lobby`, { replace: true });
                }}
              >
                Login
              </Button>
            </ButtonSet>
          </Stack>
        </Column>
      </Grid>
    </Theme>
  );
}
