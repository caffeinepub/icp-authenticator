/* eslint-disable */
// @ts-nocheck
import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';
import type { Principal } from '@icp-sdk/core/principal';

export interface Account {
  id: bigint;
  accountName: string;
  issuer: string;
  secret: string;
}
export type Result_Nat = { ok: bigint } | { err: string };
export type Result_Unit = { ok: null } | { err: string };
export type Result_Accounts = { ok: Account[] } | { err: string };
export interface _SERVICE {
  register: ActorMethod<[], Result_Unit>;
  getOwner: ActorMethod<[], [Principal] | []>;
  addAccount: ActorMethod<[string, string, string], Result_Nat>;
  getAccounts: ActorMethod<[], Result_Accounts>;
  deleteAccount: ActorMethod<[bigint], Result_Unit>;
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
