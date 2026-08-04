import { useState } from "react";
import { connectWallet } from "../services/sphere";

export default function WalletCard() {
  const [status, setStatus] = useState("Not Connected");
  const [address, setAddress] = useState("--");

  async function handleConnectWallet() {
    try {
      setStatus("Connecting...");

      const result = await connectWallet();

      setAddress(
        result.connection.identity?.directAddress || "--"
      );

      setStatus("Connected ✅");
    } catch (err: any) {
      console.error(err);

      alert(
        err?.message ||
        JSON.stringify(err, null, 2) ||
        "Unknown error"
      );

      setStatus("Connection Failed");
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
        <strong>Balance:</strong> 0 UCT
      </p>

      <button onClick={handleConnectWallet}>
        Connect Wallet
      </button>
    </div>
  );
}
