import { useState } from "react";
import { getSphere } from "../services/sphere";

export default function WalletCard() {
  const [status, setStatus] = useState("Not Connected");

  async function createWallet() {
    try {
      setStatus("Connecting...");

      await getSphere();

      setStatus("Sphere Ready ✅");
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
        <strong>Address:</strong> --
      </p>

      <p>
        <strong>Balance:</strong> 0 UCT
      </p>

      <button onClick={createWallet}>
        Create Wallet
      </button>
    </div>
  );
}
