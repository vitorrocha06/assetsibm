import { useState } from "react";

import {
  DataTable,
  Table,
  TableBatchAction,
  TableBatchActions,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarAction,
  TableToolbarContent,
  TableToolbarMenu,
  TableToolbarSearch,
  Button,
  TableSelectAll,
  TableSelectRow,
} from "@carbon/react";

import { TrashCan, Save, Download } from "@carbon/icons-react";

import "./style.scss";
import { useGlobalState } from "../../hooks/globalState";
import { sendScore } from "../../helpers/db2ApiCalls";

export default function DefaultTable({ rowData }) {
  const { logs, setLogs, selectedAssistant } = useGlobalState();

  const headerData = [
    {
      header: "ID do Log",
      key: "logId",
    },
    {
      header: "Mensagem do Cliente",
      key: "clientMessage",
    },
    {
      header: "Mensagem do Assistente",
      key: "assistantMessage",
    },
    {
      header: "Intent Identificada",
      key: "intent",
    },
    {
      header: "Nota (1 - 5)",
      key: "score",
    },
  ];

  return (
    <DataTable
      useStaticWidth
      rows={rowData ?? []}
      headers={headerData}
      useZebraStyles={true}
    >
      {({
        rows,
        headers,
        getHeaderProps,
        onInputChange,
        getRowProps,
        getBatchActionProps,
        getSelectionProps,
      }) => (
        <TableContainer title="">
          <TableToolbar>
            <TableToolbarContent>
              <Button
                tabIndex={getBatchActionProps().shouldShowBatchActions ? -1 : 0}
                onClick={async () => {
                  setLogs(
                    await sendScore(
                      logs,
                      selectedAssistant.db2.CONNECTION_STRING,
                      selectedAssistant.SKILL_NAME.skill_name.replace(
                        /[\- \/\\]/g,
                        ""
                      )
                    )
                  );
                }}
                size="sm"
                kind="primary"
              >
                Enviar Notas
              </Button>
            </TableToolbarContent>
          </TableToolbar>
          <Table>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader {...getHeaderProps({ header })}>
                    {header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow {...getRowProps({ row })}>
                  {row.cells.map((cell) => (
                    <TableCell key={cell.id}>{cell.value}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DataTable>
  );
}
