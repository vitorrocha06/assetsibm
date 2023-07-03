import {
  Accordion,
  AccordionItem,
  Button,
  Column,
  Grid,
  Loading,
  Pagination,
  Row,
  Search,
  Stack,
  Theme,
} from "@carbon/react";

import { ShowDataCards } from "@carbon/icons-react";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DateMenu } from "../../components/DatePicker";
import Header from "../../components/Header";
import { PaginationFooter } from "../../components/Pagination";
import DefaultTable from "../../components/Table";
import { getLogs } from "../../helpers/db2ApiCalls";
import {
  createRows,
  extractOldestDate,
  mergeObjects,
} from "../../helpers/misc";
import { useGlobalState } from "../../hooks/globalState";

import "./style.scss";
import { flexbox } from "@mui/system";

export function IntentSearch() {
  const { language } = useParams();
  const {
    lightMode,
    resources,
    loading,
    setLoading,
    selectedAssistant,
    logs,
    setLogs,
    startIndex,
    endIndex,
    setCurrentPage,
  } = useGlobalState();

  const [search, setSearch] = useState(null);
  const [date, setDate] = useState(null);
  const [lastDate, setLastDate] = useState(null);

  useEffect(() => {
    setLogs(null);
    setSearch(null);
    setDate(null);
    setLastDate(null);
  }, [selectedAssistant]);

  async function queryLogs() {
    setLoading(true);
    const logsFromDb2 = await getLogs({
      connectionString: selectedAssistant.db2.CONNECTION_STRING,
      schema: selectedAssistant.SKILL_NAME.replace(
        /[\- \/\\]/g,
        ""
      ).toUpperCase(),
      lastDate: null,
      date: date,
      intent: search,
    });
    if (logsFromDb2) {
      setLastDate(extractOldestDate(logsFromDb2));
      setLogs(logsFromDb2);
    } else {
      setLogs(null);
    }
    setDate(null);
    document.getElementById("datePickerInput").value = "";
    setLoading(false);
  }
  async function queryMoreLogs() {
    setLoading(true);
    const newLogsFromDb2 = await getLogs({
      connectionString: selectedAssistant.db2.CONNECTION_STRING,
      schema: selectedAssistant.SKILL_NAME.replace(
        /[\- \/\\]/g,
        ""
      ).toUpperCase(),
      lastDate: lastDate,
      date: null,
      intent: search,
    });
    if (newLogsFromDb2) {
      setLastDate(extractOldestDate(newLogsFromDb2));
      setLogs(newLogsFromDb2);
    }
    setCurrentPage(1);
    setLoading(false);
  }

  return (
    <Theme theme={lightMode ? "white" : "g100"}>
      <Header />
      <div className="content">
        {loading ? <Loading /> : ""}
        <div id="headMenu">
          <DateMenu setDate={setDate} />
          <Search
            closeButtonLabelText="Clear search input"
            id="intentSearchInput"
            placeholder="Busque por intents"
            role="searchbox"
            size="lg"
            type="text"
            onKeyDown={(e) => {
              if (e.keyCode == 13) queryLogs();
            }}
            onChange={(e) => {
              if (e.target.value) setSearch(e.target.value);
              else {
                setSearch(null);
              }
            }}
          />
          <Button onClick={() => queryLogs()}>Buscar</Button>
        </div>
        {logs ? (
          <Stack>
            <Accordion
              align="end"
              style={{ marginBottom: "3rem", marginTop: "3rem" }}
            >
              {logs &&
                Object.entries(logs)
                  .slice(startIndex, endIndex)
                  .map(([intent, logs]) => {
                    return (
                      <AccordionItem
                        className={"tableAccordion"}
                        key={logs[0].LOGID}
                        title={intent}
                      >
                        <div style={{ maxWidth: "100%" }}>
                          <DefaultTable rowData={createRows(logs)} />
                        </div>
                      </AccordionItem>
                    );
                  })}
            </Accordion>
            {endIndex >= Object.keys(logs).length ? (
              <Button
                onClick={() => {
                  queryMoreLogs();
                }}
                style={{ marginBottom: "4rem" }}
              >
                Solicitar Logs mais antigos
              </Button>
            ) : (
              ""
            )}
          </Stack>
        ) : (
          <div
            id="noResults"
            style={{ marginBottom: "3rem", marginTop: "4rem" }}
          >
            <Stack
              className="noResultsStack"
              style={{
                display: "flex",
                alignItens: "center",
                justifyContent: "center",
              }}
            >
              <ShowDataCards size={40} />
              <h3>Faça uma nova busca</h3>
            </Stack>
          </div>
        )}
      </div>
      <PaginationFooter />
    </Theme>
  );
}
