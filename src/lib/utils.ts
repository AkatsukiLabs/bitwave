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
  const formattedAmount = await formatAmount(amount, BTC_DECIMALS);

  const approve = {
    contractAddress: WBTC_ADDRESS,
    entrypoint: "approve",
    calldata: [vWBTC_ADDRESS, formattedAmount],
  };

  const deposit = {
    contractAddress: vWBTC_ADDRESS,
    entrypoint: "deposit",
    calldata: [formattedAmount, account.address],
  };

  console.log("Approve calldata:", approve);
  console.log("Deposit calldata:", deposit);
  console.log("Formatted amount:", formattedAmount);

  const tx = await account.executeBatch([approve, deposit]);

  return tx.transactionHash;
}
