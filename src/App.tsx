
// importfunctionalities
import React from 'react';
import logo from './logo.svg';
import './App.css';
import {
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import {useEffect , useState } from "react";

// Import Solana web3 functinalities
const {
  Connection,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
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
  // useEffect(() => {
  // localStorage.setItem('walletKey', JSON.stringify(walletKey));
  // }, [walletKey]);

  // useEffect(() => {
  // const walletKey = localStorage.getItem('walletKey');
  // if (walletKey) {
  //  setWalletKey(JSON.parse(walletKey));
  // }
  // }, []);


  useEffect(() => {
  localStorage.setItem('keypair', keypair);
  const arrnew = new Uint8Array(JSON.parse(keypair));
  const publicKey = Keypair.fromSecretKey(arrnew).publicKey;
  }, [keypair]);

  //  useEffect(() => {
  // if (keypair) setProvider(keypair);
	//   else setKeypair(undefined);
  // }, []);

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
  // NewKeyPair 
  
  const getNewkeypair = async () => {
      const newPair = new Keypair();
      const privateKey = newPair._keypair.secretKey;
      const arrayprivateKey = JSON.stringify(Array.from(privateKey));
      setKeypair(arrayprivateKey);     
  }
  const showNewkeypair = async () => {
      const keyFromls = JSON.parse(localStorage.getItem('keypair') || "");
      // Exact the public and private key from the keypair
      const arrnew = new Uint8Array(keyFromls);
      const publicKey = new PublicKey(keyFromls._keypair.publicKey).toString();
      const privateKey = keyFromls._keypair.secretKey;
      console.log(keypair);
      console.log(arrnew);
      //console.log(Object.values(keyFromls._keypair.publicKey));
      
  }
  
  const connectWallet = async () => {
    // @ts-ignore
    const { solana } = window;

		// checks if phantom wallet exists
    if (solana) {
      try {
				// connects wallet and returns response which includes the wallet public key
        const response = await solana.connect();
        console.log('wallet account ', response.publicKey.toString());
				// update walletKey to be the public key
        setWalletKey(response.publicKey.toString());
      } catch (err) {
      // { code: 4001, message: 'User rejected the request.' }
      }
    }
  };
   const disconnectWallet = async () => {
    // @ts-ignore
    const { solana } = window;

		// checks if phantom wallet exists
    if (solana) {
      try {
				// connects wallet and returns response which includes the wallet public key
        const response = await solana.disconnect();
				// update walletKey to be the public key
        setWalletKey(undefined);
      } catch (err) {
      // { code: 4001, message: 'User rejected the request.' }
      }
    }
  };

	// HTML code for the app
  return (
    <div className="App">
        <div className="App-header1">
      {provider && walletKey && (
          <button
            style={{
              fontSize: "14px",
              padding: "14px",
              fontWeight: "bold",
              borderRadius: "5px",
              cursor: "pointer",
              marginLeft: "auto",
            
            }}
            onClick={disconnectWallet}
          >
            Disconnect Wallet
          </button>
        )}
        </div>
      <header className="App-header">
        <h3>Your New Account Address: {(publicKey)? publicKey : ""}</h3>
        <br/>
        <br/>
        <h2>Connect to Phantom Wallet</h2>
        <button
            style={{
              fontSize: "16px",
              padding: "15px",
              fontWeight: "bold",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={showNewkeypair}
          >
            show key
          </button>
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
            Genarate NewKeyPair
          </button>
      
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
            Connect Wallet
          </button>
        )}
        {provider && walletKey && <p>Connected account</p> }
        
       

        {!provider && (
          <p>
            No provider found. Install{" "}
            <a href="https://phantom.app/">Phantom Browser extension</a>
          </p>
        )}
        </header>
    </div>
  );
}

export default App;
