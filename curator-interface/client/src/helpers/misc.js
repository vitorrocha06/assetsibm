import { SelectItem, SelectItemGroup } from "@carbon/react";
import axios from "axios";
import BasicRating from "../components/Rating";

export function createRows(conversation) {
  let rowsAux = [];

  conversation.forEach((log) => {
    let rowAux = {};

    rowAux.id = log.LOGID;
    rowAux.CONVERSATIONID = log.CONVERSATIONID;
    rowAux.logId = log.LOGID;
    rowAux.clientMessage = log.CLIENTMESSAGE;
    rowAux.assistantMessage = log.ASSISTANTMESSAGE;
    rowAux.intent = log.FIRSTINTENT;
    rowAux.clientTimestamp = log.CLIENTTIMESTAMP;
    rowAux.score = (
      <BasicRating
        intent={log.FIRSTINTENT}
        logID={log.LOGID}
        defaultValue={log.SCORE}
      />
    );

    rowsAux.push(rowAux);
  });

  return rowsAux;
}

export function getRoute(path) {
  let args = Array.prototype.slice.call(arguments, 1);
  let count = -1;

  path = path.replace("/", "/:");
  return path.replace(/:[a-zA-Z?]+/g, (match) => {
    count += 1;
    return args[count] !== undefined ? args[count] : match;
  });
}

export function organizeByAccount(array, disabled) {
  return Object.entries(groupBy(array)).map(([account, accountResources]) => {
    return (
      <SelectItemGroup label={account}>
        {accountResources.map((resource, index) => {
          return (
            <SelectItem
              key={`resourceItem-${index}-${resource.guid}`}
              text={disabled ? "Using Manual Input" : resource.name}
              value={resource.guid}
            />
          );
        })}
      </SelectItemGroup>
    );
  });
}

export function groupBy(array) {
  return array.reduce((objectsByKeyValue, obj) => {
    const value = obj.accountName;
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});
}

export function extractOldestDate(logs) {
  const oldestDate = Object.values(logs).reduce((acc, logs) => {
    for (let log of logs) {
      if (new Date(log.CLIENTTIMESTAMP) < acc) {
        acc = new Date(log.CLIENTTIMESTAMP);
      }
      return acc;
    }
  }, new Date());

  return oldestDate
    .toLocaleDateString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    })
    .split("/")
    .reverse()
    .join("-");
}

export function mergeObjects(oldObj, newObj) {
  const tmp = { ...oldObj };
  for (var key in newObj) {
    if (tmp[key]) tmp[key] = tmp[key].concat(newObj[key]);
    else tmp[key] = newObj[key];
  }
  return tmp;
}

export async function sendMail(info) {
  try {
    await axios.post(
      "https://us-south.functions.appdomain.cloud/api/v1/web/ICC_IBM_dev/default/email-api-sendgrid",
      {
        recipientEmail: "lsoares@ibm.com,kelvinsilva@ibm.com",
        subject: "Uma de nossas demos foi acessada!",
        html: `<head>  <style>    body {      font-family: arial, sans-serif;    }    table {      border-collapse: collapse;      width: 100%;    }    td,    th {      border: 1px solid #DDDDDD;      text-align: center;      padding: 8px;    }    tr:nth-child(odd) {      background-color: #A6C8FF;    }    .tableHeader {      font-weight: bold;    }    .centered {      text-align: center;    }  </style></head><body>  <h1>Olá, Innovation Studio São Paulo!</h1>  <h2>    Você está recebendo este e-mail automático como sinalização de que uma de    nossas demos foi acessada!  </h2>  <p>O acesso foi realizado no dia <b>${
          info.date
        }</b>. Detalhes abaixo:</p>  <table>    <tr>      <td class="tableHeader">Asset Apresentado</td>      <td class="tableHeader">Cliente/Parceiro abordado</td>      <td class="tableHeader">Responsável</td>      <td class="tableHeader">Motivo</td>    </tr>    <tr>      <td>${
          info.asset
        }</td>      <td>${info.client}</td>      <td>${
          info.responsible
        }</td>      <td>${info.class}</td>    </tr>  </table> ${
          info.oportunityNumber
            ? `<p>O número de oportunidade associado foi: <b>${info.oportunityNumber}</b>.</p>`
            : "<p>Nenhum número de oportunidade foi associado.</p>"
        }  <h3 class="centered">    Caso esta seja uma iniciativa desconhecida, seria bom entrarmos em contato    com o responsável!  </h3></body>`,
      }
    );
  } catch (err) {
    console.log(err);
  }
}

export const emailRegex =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const opportunityNumberRegex = /\d{4}[A-z]{1}\d{5}[A-z]{2}\d{1}[A-z]{5}/;
