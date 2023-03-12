import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

export interface GlobalPool {
  superAdmin: PublicKey; // 32
  loyaltyWallet: PublicKey; // 8
  loyaltyFee: anchor.BN; // 8
  totalRound: anchor.BN; // 8
}

export interface AccountData {
  name: String;
  nftMint: PublicKey;
}

export interface GameData {
  playTime: anchor.BN; // 8
  amount: anchor.BN; // 8
  rewardAmount: anchor.BN; // 8
  setNum: anchor.BN; // 8
  rand: anchor.BN; // 8
}

export interface PlayerPool {
  // 8 + 104 = 112
  player: PublicKey; // 32
  round: anchor.BN; // 8
  gameData: GameData; // 40
  winTimes: anchor.BN; // 8
  receivedReward: anchor.BN; // 8
  claimableReward: anchor.BN; // 8
}

export const PLAYER_POOL_SIZE = 112;
export const LAMPORTS = 1000000000;
export const GLOBAL_AUTHORITY_SEED = "global-authority";
export const VAULT_AUTHORITY_SEED = "vault-authority";

export const PROGRAM_ID = "D7gqVkb2mTcEsoCDUB9ZjFA6Z5uN2MmwahwRRWjFgR3G";
export const TRESURY_WALLET = new PublicKey(
  "ZJtiGbC2RqMF4WBLtsknqjdZgVakzWbzt4DkutjdCrG"
);

export const NONCE = "29L53hyG";

export interface HistoryItem {
  address: string;
  bet_amount: number;
  block_hash: number;
  block_timestamp: number;
  signature: string;
  type: number;
  win: number;
}
