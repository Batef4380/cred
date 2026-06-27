import { formatUnits } from "viem";

export function formatTokenAmount(amount: bigint, maxDecimals = 2): string {
  const value = Number(formatUnits(amount, 18));
  return value.toLocaleString(undefined, { maximumFractionDigits: maxDecimals });
}

export function initialsFromHandle(handle: string): string {
  if (!handle) return "?";
  if (ADDRESS_PATTERN.test(handle)) return handle.slice(2, 4).toUpperCase();
  return handle.slice(0, 2).toUpperCase();
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;

/** Identities are currently registered using the wallet address as the "handle" — shorten it for display. */
export function displayHandle(handle: string): string {
  if (ADDRESS_PATTERN.test(handle)) return shortAddress(handle);
  return handle;
}
