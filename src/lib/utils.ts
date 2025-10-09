import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AegisSDK } from "@cavos/aegis";
import { formatAmount } from "cavos-service-sdk";
import { WBTC_ADDRESS, vWBTC_ADDRESS } from "../config/contracts";
import { BTC_DECIMALS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function depositVesu(account: AegisSDK, amount: number) {
  const approve = {
    contractAddress: WBTC_ADDRESS,
    entrypoint: 'approve',
    calldata: [account.address, formatAmount(amount, BTC_DECIMALS)],
  }

  const deposit = {
    contractAddress: vWBTC_ADDRESS,
    entrypoint: 'deposit',
    calldata: [formatAmount(amount, BTC_DECIMALS), account.address],
  }
  const tx = await account.executeBatch([approve, deposit]);
  return tx.transactionHash;
}
