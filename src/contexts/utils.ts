import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { web3 } from "@project-serum/anchor";
import { NETWORK } from "../config";

// export const solConnection = new web3.Connection(
//   "https://blue-patient-thunder.solana-mainnet.quiknode.pro/71df344b7faca0a88bc82476e5d3ac772102554e/"
// );

// export const solConnection = new web3.Connection(web3.clusterApiUrl(NETWORK));
export const solConnection = new web3.Connection(
  "https://delicate-withered-theorem.solana-devnet.quiknode.pro/0399d35b8b5de1ba358bd014f584ba88d7709bcf/"
);

export const getSolbalance = async (wallet: PublicKey) => {
  try {
    const balance = await solConnection.getBalance(wallet);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

export const filterError = (error: number) => {
  switch (error) {
    case 6000:
      return "Invalid Player Pool Owner";
    case 6001:
      return "Invalid Admin to Withdraw";
    case 6002:
      return "Invalid Reward Vault to receive";
    case 6003:
      return "Insufficient Reward SOL Balance";
    case 6004:
      return "Transaction failed, not enough balance";
    default:
      return "";
  }
};
