import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> { __kind__: "Some"; value: T; }
export interface None { __kind__: "None"; }
export type Option<T> = Some<T> | None;
export interface Account {
  id: bigint;
  accountName: string;
  issuer: string;
  secret: string;
}
export type Result_Nat = { ok: bigint } | { err: string };
export type Result_Unit = { ok: null } | { err: string };
export type Result_Accounts = { ok: Account[] } | { err: string };
export interface backendInterface {
  register: () => Promise<Result_Unit>;
  getOwner: () => Promise<[Principal] | []>;
  addAccount: (accountName: string, issuer: string, secret: string) => Promise<Result_Nat>;
  getAccounts: () => Promise<Result_Accounts>;
  deleteAccount: (id: bigint) => Promise<Result_Unit>;
}
