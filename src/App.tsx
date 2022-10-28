// importfunctionalities
import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useEffect, useState } from "react";
import * as buffer from "buffer";
window.Buffer = buffer.Buffer;
// Import Solana web3 functinalities
const {
  Connection,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  sendAndConfirmRawTransaction,
  sendAndConfirmTransaction,
} = require("@solana/web3.js");

// create types
type DisplayEncoding = "utf8" | "hex";

type PhantomEvent = "disconnect" | "connect" | "accountChanged";
type PhantomRequestMethod =
  | "connect"
  | "disconnect"
  | "signTransaction"
  | "signAllTransactions"
  | "signMessage";

interface ConnectOpts {
  onlyIfTrusted: boolean;
}

// create a provider interface (hint: think of this as an object) to store the Phantom Provider
interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage: (
    message: Uint8Array | string,
    display?: DisplayEncoding
  ) => Promise<any>;
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
}

/**
 * @description gets Phantom provider, if it exists
 */
const getProvider = (): PhantomProvider | undefined => {
  if ("solana" in window) {
    // @ts-ignore
    const provider = window.solana as any;
    if (provider.isPhantom) return provider as PhantomProvider;
  }
};

function App() {
  // create state variable for the provider
  const [provider, setProvider] = useState<PhantomProvider | undefined>(
    undefined
  );
  // create state variable for the wallet key
  const [walletKey, setWalletKey] = useState<PhantomProvider | undefined>(
    undefined
  );
  // create state variable for New keypair generate
  const [keypair, setKeypair] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [solbal, setSolbal] = useState(0);
  const [tsignature, setTsignature] = useState("");
  const [loadmsg, setLoadmsg] = useState("No message");

  // this is the function that runs whenever the component updates (e.g. render, refresh)
  useEffect(() => {
    const provider = getProvider();
    // if the phantom provider exists, set this as the provider
    if (provider) setProvider(provider);
    else setProvider(undefined);
  }, []);

  /**
   * @description prompts user to connect wallet if it exists.
   * This function is called when the connect wallet button is clicked
   */
  const loadV = async (getMsg: any) => {
    if (getMsg === "on") {
      setLoadmsg("Please Wait, Processing...");
    } else {
      setLoadmsg("No message");
    }
  };

  //get Balance
  const getWalletBalance = async () => {
    loadV("on");
    try {
      // Connect to the Devnet
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
      console.log("Connection object is:", connection);
      // get its balance
      const walletBalance = await connection.getBalance(
        new PublicKey(publicKey)
      );
      const solbal = parseInt(walletBalance) / LAMPORTS_PER_SOL;
      setSolbal(solbal);
      loadV("off");
      console.log(
        `Wallet balance: ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`
      );
    } catch (err) {
      console.log(err);
    }
    loadV("off");
  };

  const makeAirdrop = async () => {
    loadV("on");
    // Connect to the Devnet
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    console.log("Connection object is:", connection);
    // Request airdrop of 2 SOL to the wallet
    console.log("Airdropping some SOL to my wallet!");
    var airdropAmount = LAMPORTS_PER_SOL / 1000;
    console.log(airdropAmount);
    const fromAirDropSignature = await connection.requestAirdrop(
      new PublicKey(publicKey),
      airdropAmount
    );
    // we can use this also -> await connection.confirmTransaction(fromAirDropSignature);
    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();
    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: fromAirDropSignature,
    });
    console.log("Airdrop completed for the Sender account");
    getWalletBalance();
  };

  const airDropgetWalletBalance = async (publicKey1: any) => {
    loadV("on");
    try {
      // Connect to the Devnet
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
      console.log("Connection object is:", connection);
      // Request airdrop of 2 SOL to the wallet
      console.log("Airdropping some SOL to my wallet!");
      var airdropAmount = LAMPORTS_PER_SOL * 2;
      console.log(airdropAmount);
      const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(publicKey1),
        airdropAmount
      );
      // we can use this also -> await connection.confirmTransaction(fromAirDropSignature);
      // Latest blockhash (unique identifer of the block) of the cluster
      let latestBlockHash = await connection.getLatestBlockhash();
      // Confirm transaction using the last valid block height (refers to its time)
      // to check for transaction expiration
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature,
      });
      console.log("Airdrop completed for the Sender account");
      // Make a wallet (keypair) from privateKey and get its balance
      const walletBalance = await connection.getBalance(
        new PublicKey(publicKey1)
      );
      const solbal = parseInt(walletBalance) / LAMPORTS_PER_SOL;
      setSolbal(solbal);
      console.log(
        `Wallet balance: ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`
      );
    } catch (err) {
      console.log(err);
    }
    loadV("off");
    alert("New Solana Account Created And Airdropped 2 SOL");
  };

  // NewKeyPair
  const getNewkeypair = async () => {
    loadV("on");
    console.log("New keypair is generating!");
    const newPair = new Keypair();
    const privateKey = newPair._keypair.secretKey;
    const arrayprivateKey = JSON.stringify(Array.from(privateKey));
    setKeypair(arrayprivateKey);
    const publicKey = new PublicKey(newPair._keypair.publicKey).toString();
    setPublicKey(publicKey);
    airDropgetWalletBalance(publicKey);
    // loadV("off");
  };

  const connectWallet = async () => {
    loadV("on");
    // @ts-ignore
    const { solana } = window;

    // checks if phantom wallet exists
    if (solana) {
      try {
        // connects wallet and returns response which includes the wallet public key
        const response = await solana.connect();
        console.log("wallet account ", response.publicKey.toString());
        // update walletKey to be the public key
        setWalletKey(response.publicKey.toString());
        alert("Successfully Connected Wallet");
      } catch (err) {
        // { code: 4001, message: 'User rejected the request.' }
      }
    }
    loadV("off");
  };
  const disconnectWallet = async () => {
    loadV("on");
    // @ts-ignore
    const { solana } = window;

    // checks if phantom wallet exists
    if (solana) {
      try {
        // connects wallet and returns response which includes the wallet public key
        const response = await solana.disconnect();
        // update walletKey to be the public key
        setWalletKey(undefined);
        alert("Successfully Disconnected Wallet");
      } catch (err) {
        // { code: 4001, message: 'User rejected the request.' }
      }
    }
    loadV("off");
  };

  const transferSol = async () => {
    loadV("on");
    if (!walletKey || !publicKey) {
      let sendMsg = walletKey
        ? "Please Create a new Solana account to transfer SOL"
        : "Please Connect to Phantom Wallet to transfer SOL";
      alert(sendMsg);
      loadV("off");
    } else {
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
      const keyFromls = JSON.parse(keypair);
      // Exact the public and private key from the keypair
      const arrnew = new Uint8Array(keyFromls);
      // Get Keypair from Secret Key
      //console.log(arrnew);
      var from = Keypair.fromSecretKey(arrnew);
      // Send money from "from" wallet and into "to" wallet
      if (solbal <= 0) {
        alert(`Invalid SOL, Your Balance is ${solbal}`);
        loadV("off");
      } else if (solbal < 2.000005) {
        alert(
          `Invalid SOL, Your Balance is ${solbal}, (Need Extra 0.000005 SOL For Fee)
          Airdrop 0.001 SOL to your Account`
        );
        loadV("off");
      } else {
        var sendSol = LAMPORTS_PER_SOL * 2;
        console.log(typeof sendSol, sendSol);
        var transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: walletKey,
            lamports: sendSol,
          })
        );
        console.log(transaction);
        // Sign transaction
        var signature = await sendAndConfirmTransaction(
          connection,
          transaction,
          [from]
        );
        setTsignature(
          `Sent 2 SOL to address ${publicKey} And Signature is ${signature}`
        );
        console.log(
          `Sent 2 SOL to address ${publicKey} And Signature is ${signature}`
        );
        getWalletBalance();
      }
    }
  };

  // HTML code for the app
  return (
    <div className="App">
      <header className="App-header">
        <button
          style={{
            fontSize: "16px",
            padding: "15px",
            fontWeight: "bold",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={getNewkeypair}
        >
          Create a new Solana account
        </button>
        <p className="fontp">
          {publicKey && `Your New Solana Account Address: ${publicKey}`}
        </p>
        <p className="fontp">{publicKey && `Wallet balance: ${solbal} SOL`}</p>
        {publicKey && (
          <button
            style={{
              fontSize: "10px",
              padding: "10px",
              fontWeight: "bold",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={makeAirdrop}
          >
            Airdrop 0.001 SOL
          </button>
        )}
        <br />
        <div className="App-header1">Message Box: {loadmsg}</div>
        <br />
        <h5>Connect to Phantom Wallet</h5>
        {provider && walletKey && (
          <button
            style={{
              fontSize: "14px",
              padding: "14px",
              fontWeight: "bold",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={disconnectWallet}
          >
            Disconnect Wallet
          </button>
        )}
        {provider && !walletKey && (
          <button
            style={{
              fontSize: "16px",
              padding: "15px",
              fontWeight: "bold",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={connectWallet}
          >
            Connect to Phantom Wallet
          </button>
        )}
        {provider && walletKey && <p className="fontp">Connected account</p>}
        {provider && walletKey && (
          <p className="fontp">{`Your Phantom Wallet Address: ${walletKey}`}</p>
        )}

        {!provider && (
          <p>
            No provider found. Install{" "}
            <a href="https://phantom.app/">Phantom Browser extension</a>
          </p>
        )}
        <br />

        <button
          style={{
            fontSize: "16px",
            padding: "15px",
            fontWeight: "bold",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={transferSol}
        >
          Transfer to new wallet
        </button>
        <p className="fontp">{tsignature}</p>
      </header>
    </div>
  );
}

export default App;
