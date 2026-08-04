import { useState } from "react";
import { connectWallet } from "../services/sphere";

export default function WalletCard() {
  const [status, setStatus] = useState("Not Connected");
  const [address, setAddress] = useState("--");
  const [connected, setConnected] = useState(false);
  const [balance, setBalance] = useState("0 UCT");

  async function handleConnectWallet() {
    try {
      setStatus("Connecting...");

      const result = await connectWallet();

      setAddress(result.connection.identity?.directAddress || "--");
      const walletBalance = await result.client.query("sphere_getBalance");

setBalance(String(walletBalance));

      // Automatically ask the wallet to sign
      const signed = await result.client.intent("sign_message", {
        message: "Welcome to QuickBot AI",
      });

      console.log("Signature:", signed.signature);

      setStatus("Connected ✅");
      setConnected(true);

      alert("Wallet connected and signed successfully ✅");
    } catch (err: any) {
      console.error(err);

      alert(
        err?.message ||
        JSON.stringify(err, null, 2) ||
        "Unknown error"
      );

      setStatus("Connection Failed");
      setConnected(false);
      setAddress("--");
    }
  }

  async function handleDisconnect() {
    try {
      const result = await connectWallet();

      await result.disconnect();

      setStatus("Not Connected");
      setAddress("--");
      setConnected(false);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "20px",
        marginTop: "24px",
      }}
    >
      <h3>💼 Sphere Wallet</h3>

      <p>
        <strong>Status:</strong> {status}
      </p>

      <p>
        <strong>Address:</strong> {address}
      </p>

      <p>
        <strong>Balance:</strong> {balance}
      </p>

      {connected ? (
        <button onClick={handleDisconnect}>
          Disconnect Wallet
        </button>
      ) : (
        <button onClick={handleConnectWallet}>
          Connect Wallet
        </button>
      )}
    </div>
  );
        }
