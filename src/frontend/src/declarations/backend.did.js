/* eslint-disable */
// @ts-nocheck
import { IDL } from '@icp-sdk/core/candid';

export const idlFactory = ({ IDL }) => {
  const Account = IDL.Record({
    id: IDL.Nat,
    accountName: IDL.Text,
    issuer: IDL.Text,
    secret: IDL.Text,
  });
  const Result_Nat = IDL.Variant({ ok: IDL.Nat, err: IDL.Text });
  const Result_Unit = IDL.Variant({ ok: IDL.Null, err: IDL.Text });
  const Result_Accounts = IDL.Variant({ ok: IDL.Vec(Account), err: IDL.Text });
  return IDL.Service({
    register: IDL.Func([], [Result_Unit], []),
    getOwner: IDL.Func([], [IDL.Opt(IDL.Principal)], ['query']),
    addAccount: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [Result_Nat], []),
    getAccounts: IDL.Func([], [Result_Accounts], ['query']),
    deleteAccount: IDL.Func([IDL.Nat], [Result_Unit], []),
  });
};

export const idlInitArgs = [];
export const init = ({ IDL }) => { return []; };
