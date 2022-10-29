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
  const [recoverkeyin, setRecoverkeyin] = useState("");
  const [showrecovertext, setShowrecovertext] = useState("Show recover key");
  const [recoverkey, setRecoverkey] = useState("*****");
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

   
  // recover key show
  const showRecoverkey = async () => {
    if(showrecovertext === "Hide recover key"){
      setRecoverkey("*****");
      setShowrecovertext("Show recover key");
    }else{
      setRecoverkey(JSON.parse(keypair).reverse().join("-"));
      setShowrecovertext("Hide recover key");
    }
  }

  //get Balance
  const getWalletBalance = async (paraPublickey:any) => {
    loadV("on");
    try {
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
      // get its balance
      const walletBalance = await connection.getBalance(
        new PublicKey(paraPublickey)
      );
      const solbal = parseInt(walletBalance) / LAMPORTS_PER_SOL;
      setSolbal(solbal);
      loadV("off");
      // console.log(
      //   `Wallet balance: ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`
      // );
    } catch (err) {
      console.log(err);
    }
    loadV("off");
  };

  const makeAirdrop = async (paraPublickey:any) => {
    loadV("on");
    try{
     const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    // Request airdrop of 2 SOL to the wallet
    //console.log("Airdropping some SOL to my wallet!");
    var airdropAmount = LAMPORTS_PER_SOL * 2;
    //console.log(airdropAmount);
    const fromAirDropSignature = await connection.requestAirdrop(
      new PublicKey(paraPublickey),
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
    // console.log("Airdrop completed for the Sender account");
    getWalletBalance(publicKey);
    alert("Successfully Airdropped 2 SOL");
    } catch (err) {
      console.log(err);
      loadV("off");
      alert("Error to Airdrop 2 SOL, Try Again!");
    }
  };

  // NewKeyPair
  const getNewkeypair = async () => {
    loadV("on");
    // console.log("New keypair is generating!");
    const newPair = new Keypair();
    const privateKey = newPair._keypair.secretKey;
    const arrayprivateKey = JSON.stringify(Array.from(privateKey));
    const extractpublicKey = new PublicKey(newPair._keypair.publicKey).toString();
    alert("New Solana Account Created");
    setPublicKey(extractpublicKey);
    setKeypair(arrayprivateKey);
    await makeAirdrop(extractpublicKey)
    await getWalletBalance(extractpublicKey);
    loadV("off");
  };

  const connectWallet = async (userevent:any) => {
    loadV("on");
    // @ts-ignore
    const { solana } = window;
    // checks if phantom wallet exists
    if (solana) {
      try {
        // connects wallet and returns response which includes the wallet public key
        // update walletKey to be the public key
        if(userevent.target.innerText === "Connect to Phantom Wallet"){
        const response = await solana.connect();
        userevent.target.innerText = "Disconnect Wallet";
        setWalletKey(response.publicKey.toString());
        alert("Successfully Connected Wallet");
        }else{
          const response = await solana.disconnect();
          userevent.target.innerText = "Connect to Phantom Wallet";
          setWalletKey(undefined);
          setTsignature("");
          alert("Successfully Disconnected Wallet");
        }
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
        ? "Please Create a new Solana account or recover account to transfer SOL"
        : "Please Connect to Phantom Wallet to transfer SOL";
      alert(sendMsg);
      loadV("off");
    } else {
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
      const keyFromls = JSON.parse(keypair);
      // Exact the public and private key from the keypair
      const arrnew = new Uint8Array(keyFromls);
      // Get Keypair from Secret Key
      var from = Keypair.fromSecretKey(arrnew);
      // Send money from "from" wallet and into "to" wallet
      if (solbal <= 0) {
        alert(`Invalid SOL, Your Balance is ${solbal}`);
        loadV("off");
      } else if (solbal < 2.000005) {
        alert(
          `Invalid SOL, Your Balance is ${solbal}, (Need Extra 0.000005 SOL For Fee)
          Airdrop 2 SOL to your Account`
        );
        loadV("off");
      } else {
        var sendSol = LAMPORTS_PER_SOL * 2;
        // console.log(typeof sendSol, sendSol);
        var transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: walletKey,
            lamports: sendSol,
          })
        );
        // console.log(transaction);
        // Sign transaction
        var signature = await sendAndConfirmTransaction(
          connection,
          transaction,
          [from]
        );
        setTsignature(
          `Successfully Sent 2 SOL to address ${publicKey} And Signature is ${signature}`
        );
        // console.log(
        //   `Sent 2 SOL to address ${publicKey} And Signature is ${signature}`
        // );
        getWalletBalance(publicKey);
      }
    }
  };

  const getRecoverAcc = async () => {
    if(recoverkeyin === ""){
      alert("Enter Recover Key");
      loadV("off");
    }else{
     loadV("on");
    const extractRekey = recoverkeyin.split("-").reverse();
    const newextractRekey = [];
    for(let num of extractRekey){
      newextractRekey.push(parseInt(num));
    }
    const arrnew = new Uint8Array(newextractRekey);
    setKeypair(JSON.stringify(newextractRekey));
    try{
    console.log(PublicKey.isOnCurve(Keypair.fromSecretKey(arrnew).publicKey));
    alert("Successfully Recovered Your Account Wallet");
    setPublicKey(Keypair.fromSecretKey(arrnew).publicKey);
    setRecoverkeyin("");
    setShowrecovertext("Show recover key");
    getWalletBalance(Keypair.fromSecretKey(arrnew).publicKey);
    }catch(err){alert("Invalid Recover Key");loadV("off");}
  }
  };

  // HTML code for the app
  return (
    <div className="App">
      <header className="App-header">
        {!publicKey && (
        <button
          style={{
            fontSize: "14px",
            padding: "14px",
            fontWeight: "bold",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={getNewkeypair}
        >
          Create a new Solana account
        </button>
        )}
        <br/>
        {!publicKey && (
        <input style={{
            width:"300px",
            fontSize: "12px",
            padding: "14px",
            fontWeight: "bold",
            borderRadius: "5px",
            cursor: "pointer",
          }} type="text" value={recoverkeyin} onChange={(e) => setRecoverkeyin(e.target.value)} placeholder="Paste Your Recover Key to access account" />
        )}
        {!publicKey && (
        <button
          style={{
            fontSize: "14px",
            padding: "14px",
            fontWeight: "bold",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={getRecoverAcc}
        >
          Recover your account
        </button>
        )}
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
            onClick={()=>getWalletBalance(publicKey)}
          >
            refresh balance
          </button>
        )}
        {publicKey && (
          <div>
          <button
            style={{
              fontSize: "10px",
              padding: "10px",
              fontWeight: "bold",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={showRecoverkey}
          >
            {showrecovertext}
          </button>
          <p className="fontp">do not share your recover key, copy and save key for recover your wallet and access</p>
          </div>
        )}
        {publicKey && (
          <p
            style={{
              fontSize: "10px",
              padding: "10px",
              fontWeight: "bold",
              borderRadius: "5px",
              border:"2px solid skyblue",
            }}
          >
            {recoverkey}
          </p>
        )}
        {publicKey && (
          <button
            style={{
              fontSize: "10px",
              padding: "10px",
              fontWeight: "bold",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={()=>makeAirdrop(publicKey)}
          >
            Airdrop 2 SOL
          </button>
        )}
        {publicKey && (
          <button
            style={{
              fontSize: "10px",
              padding: "10px",
              fontWeight: "bold",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={()=>{let getRe = window.confirm("Are you sure to logout. copy your recover key before logout, Otherwise you will not access to wallet again");if(getRe === true){setPublicKey("");setSolbal(0);setRecoverkey("*****");setKeypair("");setTsignature("")}}}
          >
            Logout
          </button>
        )}
        <br />
        <div className="App-header1">Message Box: {loadmsg}</div>
        <br />
        <h5>Connect to Phantom Wallet</h5>
        {provider && (
          <button
            style={{
              fontSize: "16px",
              padding: "15px",
              fontWeight: "bold",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={(event)=>connectWallet(event)}
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
