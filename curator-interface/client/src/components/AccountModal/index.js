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
} from "@carbon/react";

import "./style.scss";
import { useGlobalState } from "../../hooks/globalState";
import {
  listAccounts,
  queryAllResources,
} from "../../helpers/resourcesApiCalls";

export function AccountModal() {
  const {
    accountModalOpen,
    setAccountModalOpen,
    accounts,
    setAccounts,
    account,
    setAccount,
    setResources,
    setLoading,
  } = useGlobalState();

  useEffect(() => {
    saveAccountsToState();
  }, []);

  async function saveAccountsToState() {
    setLoading(true);
    const accounts = await listAccounts();
    setAccounts(accounts);
    setAccount(JSON.stringify(accounts[0]));
    setLoading(false);
  }

  async function getResources() {
    setLoading(true);
    const response = await queryAllResources(account);
    setResources(response);
    setLoading(false);
  }

  return (
    <ComposedModal
      size="lg"
      open={accountModalOpen}
      onRequestClose={() => {
        setAccountModalOpen(false);
      }}
      onClose={() => {
        setAccountModalOpen(false);
      }}
      preventCloseOnClickOutside={true}
    >
      <ModalHeader label="Conta Cloud">
        <p style={{ textAlign: "justify" }}>
          Selecione abaixo a conta da qual deseja listar recursos
        </p>
      </ModalHeader>
      <ModalBody>
        <Select
          labelText="Contas IBM Cloud"
          onChange={async (e) => {
            const value = e.target.value;
            setAccount(value);
          }}
        >
          {accounts?.map((account, index) => (
            <SelectItem
              key={`account-${index}`}
              text={account.entity.name}
              value={JSON.stringify(account)}
            />
          ))}
        </Select>
      </ModalBody>
      <ModalFooter>
        <Button
          kind="primary"
          disabled={!account}
          onClick={async () => {
            setAccountModalOpen(false);
            await getResources();
          }}
        >
          Selecionar
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
}
