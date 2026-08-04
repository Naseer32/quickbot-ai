import { useState } from "react";
import { getSphere } from "../services/sphere";

export default function WalletCard() {
  const [status, setStatus] = useState("Not Connected");
  const [address, setAddress] = useState("--");

  async function connectWallet() {
    try {
      setStatus("Connecting...");

      const sphere = await getSphere();

      setAddress(sphere.identity?.directAddress || "--");
      setStatus("Connected ✅");
    } catch (err) {
      console.error(err);
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

      <button onClick={connectWallet}>
        Connect Wallet
      </button>
    </div>
  );
}
