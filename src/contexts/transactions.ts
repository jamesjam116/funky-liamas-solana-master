import * as anchor from "@project-serum/anchor";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PartiallyDecodedInstruction,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionError,
} from "@solana/web3.js";
import { errorAlert, successAlert } from "../components/toastGroup";

import { IDL as GameIDL } from "./coinflip";
import {
  GlobalPool,
  GLOBAL_AUTHORITY_SEED,
  NONCE,
  PlayerPool,
  PLAYER_POOL_SIZE,
  PROGRAM_ID,
  TRESURY_WALLET,
  VAULT_AUTHORITY_SEED,
} from "./type";
import { filterError, solConnection } from "./utils";

export const initializeUserPool = async (wallet: WalletContextState) => {
  const cloneWindow: any = window;
  let provider = new anchor.AnchorProvider(
    solConnection,
    cloneWindow["solana"],
    anchor.AnchorProvider.defaultOptions()
  );
  try {
    let tx = await initUserPoolTx(wallet);
    if (tx) {
      let { blockhash } = await provider.connection.getLatestBlockhash(
        "confirmed"
      );
      tx.feePayer = wallet.publicKey as PublicKey;
      tx.recentBlockhash = blockhash;
      if (wallet.signTransaction !== undefined) {
        let signedTx = await wallet.signTransaction(tx);

        let txId = await provider.connection.sendRawTransaction(
          signedTx.serialize(),
          {
            skipPreflight: true,
            maxRetries: 3,
            preflightCommitment: "confirmed",
          }
        );
        await solConnection.confirmTransaction(txId, "finalized");
      }
    }
    successAlert("Transaction confirmed!");
  } catch (error) {
    console.log(error);
  }
};

export const playGame = async (
  wallet: WalletContextState,
  setValue: number,
  deposit: number,
  setLoading: Function,
  setDepositLoading: Function,
  setFlipLoading: Function,
  setEnd: Function,
  setProgress: Function,
  setIsDec: Function,
  setIsInc: Function,
  setIsWon: Function,
  setIsStartFlipping: Function,
  updatePage: Function
) => {
  if (wallet.publicKey === null) return;
  const cloneWindow: any = window;
  const userAddress = wallet.publicKey;
  let txId = "";
  try {
    setLoading(true);
    setDepositLoading(true);
    setProgress(true);
    let provider = new anchor.AnchorProvider(
      solConnection,
      cloneWindow["solana"],
      anchor.AnchorProvider.defaultOptions()
    );

    console.log("bet:", deposit);
    let tx = await createPlayGameTx(wallet, setValue, deposit);
    console.log("tx", tx);
    if (tx) {
      let { blockhash } = await provider.connection.getLatestBlockhash(
        "confirmed"
      );
      tx.feePayer = wallet.publicKey as PublicKey;
      tx.recentBlockhash = blockhash;
      if (wallet.signTransaction !== undefined) {
        let signedTx = await wallet.signTransaction(tx);

        txId = await provider.connection.sendRawTransaction(
          signedTx.serialize(),
          {
            skipPreflight: true,
            maxRetries: 3,
            preflightCommitment: "confirmed",
          }
        );

        const txConfirmation: any = await solConnection.confirmTransaction(
          txId,
          "confirmed"
        );
        console.log("txConfirmation", txConfirmation);
        console.log("txConfirmation value", txConfirmation.value);
        console.log("txConfirmation error", txConfirmation.value.err);

        if (txConfirmation.value.err === null) {
          // Tx Success, play FE
          setDepositLoading(false);
          setIsDec(true);
          setFlipLoading(true);
        } else {
          // @ts-ignore
          const errorCode = txConfirmation.value.err.InstructionError[1].Custom;

          // Error Mapping:
          // #[msg("Invalid Player Pool Owner")] // 6000
          // #[msg("Invalid Admin to Withdraw")] // 6001
          // #[msg("Invalid Reward Vault to receive")] // 6002
          // #[msg("Insufficient Reward SOL Balance")] // 6003
          // #[msg("Insufficient User SOL Balance")] // 6004

          // Tx ERROR!
          console.error("Tx Error", txConfirmation.value.err);
          console.error("Tx Error", errorCode);
          const errorTxt = filterError(errorCode);

          errorAlert(errorTxt);

          setEnd(false);
          setDepositLoading(false);
          setFlipLoading(false);
          setProgress(false);
          setLoading(false);
          return undefined;

          // TBD Oura:
          // 1- Should stop rest of FE execution
          // 2- Should show Toast to player - "Transaction failed, not enough balance"
          // 3- Nice to have: show correct error msg according to the error codes from program as shown in error mapping above
        }
      }
    }

    const program = new anchor.Program(
      GameIDL as anchor.Idl,
      PROGRAM_ID,
      provider
    );

    const playerPoolKey = await PublicKey.createWithSeed(
      userAddress,
      "player-pool",
      program.programId
    );

    const userPoolData = (await program.account.playerPool.fetch(
      playerPoolKey
    )) as unknown as PlayerPool;

    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
    const soltNum = await getSlotNumber(txId);
    if (soltNum) {
      if (soltNum % 2 === setValue) {
        setIsWon(true);
      }
    }
    updatePage();
    setIsStartFlipping(true);
    await new Promise((resolve) => {
      setTimeout(resolve, 2500);
    });
    setIsInc(true);
    setFlipLoading(false);
    setEnd(true);
    setLoading(false);
    // setProgress(false);
    // successAlert("Transaction confirmed!");
    return userPoolData;
  } catch (error) {
    setEnd(false);
    setDepositLoading(false);
    setFlipLoading(false);
    setProgress(false);
    setLoading(false);
    console.log(error);
    return undefined;
  }
  // const userPoolData = await program.account.playerPool.fetch(playerPoolKey);
  // console.log(userPoolData.gameData);
};

export const claim = async (
  wallet: WalletContextState,
  startLoading: Function,
  closeLoading: Function,
  updatePage: Function
) => {
  if (wallet.publicKey === null) return;
  try {
    startLoading();
    const cloneWindow: any = window;
    let provider = new anchor.AnchorProvider(
      solConnection,
      cloneWindow["solana"],
      anchor.AnchorProvider.defaultOptions()
    );
    let tx = await createClaimTx(wallet);
    if (tx) {
      let { blockhash } = await provider.connection.getLatestBlockhash(
        "confirmed"
      );
      tx.feePayer = wallet.publicKey as PublicKey;
      tx.recentBlockhash = blockhash;
      if (wallet.signTransaction !== undefined) {
        let signedTx = await wallet.signTransaction(tx);

        let txId = await provider.connection.sendRawTransaction(
          signedTx.serialize(),
          {
            skipPreflight: true,
            maxRetries: 3,
            preflightCommitment: "confirmed",
          }
        );

        await solConnection.confirmTransaction(txId, "finalized");
      }
    }
    closeLoading();
    successAlert("Transaction confirmed!");
    updatePage();
  } catch (error) {
    closeLoading();
    console.log(error);
  }
};

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////

export const initUserPoolTx = async (wallet: WalletContextState) => {
  if (wallet.publicKey === null) return;
  const cloneWindow: any = window;
  const userAddress = wallet.publicKey;
  let provider = new anchor.AnchorProvider(
    solConnection,
    cloneWindow["solana"],
    anchor.AnchorProvider.defaultOptions()
  );
  const program = new anchor.Program(
    GameIDL as anchor.Idl,
    PROGRAM_ID,
    provider
  );
  const playerPoolKey = await PublicKey.createWithSeed(
    userAddress,
    "player-pool",
    program.programId
  );

  let tx = new Transaction();

  let ix = SystemProgram.createAccountWithSeed({
    fromPubkey: userAddress,
    basePubkey: userAddress,
    seed: "player-pool",
    newAccountPubkey: playerPoolKey,
    lamports: await solConnection.getMinimumBalanceForRentExemption(
      PLAYER_POOL_SIZE
    ),
    space: PLAYER_POOL_SIZE,
    programId: program.programId,
  });

  tx.add(ix);
  tx.add(
    program.instruction.initializePlayerPool({
      accounts: {
        owner: userAddress,
        playerPool: playerPoolKey,
      },
      instructions: [],
      signers: [],
    })
  );

  return tx;
};

export const createPlayGameTx = async (
  wallet: WalletContextState,
  setNum: number,
  deposit: number
) => {
  if (wallet.publicKey === null) return;
  const cloneWindow: any = window;
  const userAddress = wallet.publicKey;
  let provider = new anchor.AnchorProvider(
    solConnection,
    cloneWindow["solana"],
    anchor.AnchorProvider.defaultOptions()
  );
  const program = new anchor.Program(
    GameIDL as anchor.Idl,
    PROGRAM_ID,
    provider
  );
  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );

  const state = await getGlobalState();
  if (state === null) return;

  const [rewardVault, vaultBump] = await PublicKey.findProgramAddress(
    [Buffer.from(VAULT_AUTHORITY_SEED)],
    program.programId
  );

  const playerPoolKey = await PublicKey.createWithSeed(
    userAddress,
    "player-pool",
    program.programId
  );

  const tx = new Transaction();
  const poolAccount = await solConnection.getAccountInfo(playerPoolKey);
  if (poolAccount === null || poolAccount.data === null) {
    const tx1 = await initUserPoolTx(wallet);
    if (tx1) {
      tx.add(tx1);
    }
  }

  tx.add(
    program.instruction.playGame(
      bump,
      vaultBump,
      new anchor.BN(setNum),
      new anchor.BN(deposit * LAMPORTS_PER_SOL),
      {
        accounts: {
          owner: userAddress,
          playerPool: playerPoolKey,
          globalAuthority,
          rewardVault: rewardVault,
          treasuryWallet: state.loyaltyWallet,
          systemProgram: SystemProgram.programId,
        },
        signers: [],
      }
    )
  );

  return tx;
};

export const createClaimTx = async (wallet: WalletContextState) => {
  if (wallet.publicKey === null) return;
  const cloneWindow: any = window;
  const userAddress = wallet.publicKey;
  let provider = new anchor.AnchorProvider(
    solConnection,
    cloneWindow["solana"],
    anchor.AnchorProvider.defaultOptions()
  );
  const program = new anchor.Program(
    GameIDL as anchor.Idl,
    PROGRAM_ID,
    provider
  );
  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );

  const [rewardVault, vaultBump] = await PublicKey.findProgramAddress(
    [Buffer.from(VAULT_AUTHORITY_SEED)],
    program.programId
  );

  const playerPoolKey = await PublicKey.createWithSeed(
    userAddress,
    "player-pool",
    program.programId
  );

  let tx = new Transaction();

  tx.add(
    program.instruction.claimReward(bump, vaultBump, {
      accounts: {
        owner: userAddress,
        playerPool: playerPoolKey,
        globalAuthority,
        rewardVault: rewardVault,
        systemProgram: SystemProgram.programId,
      },
    })
  );

  return tx;
};

export const getGlobalState = async (): Promise<GlobalPool | null> => {
  const cloneWindow: any = window;
  const provider = new anchor.AnchorProvider(
    solConnection,
    cloneWindow["solana"],
    anchor.AnchorProvider.defaultOptions()
  );
  const program = new anchor.Program(
    GameIDL as anchor.Idl,
    PROGRAM_ID,
    provider
  );
  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  try {
    let globalState = await program.account.globalPool.fetch(globalAuthority);
    return globalState as unknown as GlobalPool;
  } catch {
    return null;
  }
};

export const getUserPoolState = async (
  wallet: WalletContextState
): Promise<PlayerPool | null> => {
  if (wallet.publicKey == null) return null;
  let cloneWindow: any = window;
  const userAddress = wallet.publicKey;
  let provider = new anchor.AnchorProvider(
    solConnection,
    cloneWindow["solana"],
    anchor.AnchorProvider.defaultOptions()
  );
  const program = new anchor.Program(
    GameIDL as anchor.Idl,
    PROGRAM_ID,
    provider
  );
  const playerPoolKey = await PublicKey.createWithSeed(
    userAddress,
    "player-pool",
    program.programId
  );

  try {
    let poolState = await program.account.playerPool.fetch(playerPoolKey);
    return poolState as unknown as PlayerPool;
  } catch {
    return null;
  }
};

export const getBankBalance = async () => {
  let cloneWindow: any = window;
  let provider = new anchor.AnchorProvider(
    solConnection,
    cloneWindow["solana"],
    anchor.AnchorProvider.defaultOptions()
  );
  const program = new anchor.Program(
    GameIDL as anchor.Idl,
    PROGRAM_ID,
    provider
  );
  const [rewardVault, vaultBump] = await PublicKey.findProgramAddress(
    [Buffer.from(VAULT_AUTHORITY_SEED)],
    program.programId
  );
  const balance = solConnection.getBalance(rewardVault);
  return balance;
};
// Get signautres related with Program Pubkey
export const getAllTransactions = async (programId: PublicKey) => {
  const data = await solConnection.getSignaturesForAddress(
    programId,
    { limit: 15 },
    "confirmed"
  );
  let result = [];
  let txdata = data.filter((tx) => tx.err === null);
  let cnt = 0;
  for (let i = 0; i < txdata.length; i++) {
    let rt = await getDataFromSignature(txdata[i].signature);
    if (rt !== undefined && cnt < 10) {
      cnt++;
      result.push(rt);
    }
  }
  return result;
};

export const getSlotNumber = async (sig: string) => {
  let tx;
  try {
    tx = await solConnection.getParsedTransaction(sig, "confirmed");
  } catch (e) {}

  if (!tx) {
    return;
  }

  let ts = tx.slot ?? 0;
  return ts;
};
// Parse activity from a transaction siganture
export const getDataFromSignature = async (sig: string) => {
  // Get transaction data from on-chain
  let tx;
  try {
    tx = await solConnection.getParsedTransaction(sig, "confirmed");
  } catch (e) {}

  if (!tx) {
    return;
  }

  if (tx.meta?.err !== null) {
    return;
  }

  // Parse activty by analyze fetched Transaction data
  let length = tx.transaction.message.instructions.length;
  let valid = 0;
  let hash = "";
  let ixId = -1;
  for (let i = 0; i < length; i++) {
    hash = (
      tx.transaction.message.instructions[i] as PartiallyDecodedInstruction
    ).data;
    if (hash !== undefined && hash.slice(0, 8) === NONCE) {
      valid = 1;
    }
    if (valid === 1) {
      ixId = i;
      break;
    }
  }

  if (ixId === -1 || valid === 0) {
    return;
  }

  let ts = tx.slot ?? 0;
  let timestamp = tx.blockTime ?? 0;
  if (!tx.meta.innerInstructions) {
    return;
  }

  let accountKeys = (
    tx.transaction.message.instructions[ixId] as PartiallyDecodedInstruction
  ).accounts;
  let signer = accountKeys[0].toBase58();

  let bytes = bs58.decode(hash);
  let a = bytes.slice(10, 18).reverse();
  let type = new anchor.BN(a).toNumber();
  let b = bytes.slice(18, 26).reverse();
  let sol_price = new anchor.BN(b).toNumber();

  let state = type === ts % 2 ? 1 : 0;

  let result = {
    type: type,
    address: signer,
    bet_amount: sol_price,
    block_hash: ts,
    block_timestamp: timestamp,
    win: state,
    signature: sig,
  };

  return result;
};
