import { useState } from "react";
import { connectWallet } from "../services/sphere";

export default function SignMessage() {
  const [signature, setSignature] = useState("");

  async function handleSign() {
    try {
      const result = await connectWallet();

      const signed = await result.client.intent("sign_message", {
        message: "Sign in to QuickBot AI",
      });

      setSignature(signed.signature);
    } catch (err) {
      console.error(err);
      alert("Signing failed");
    }
  }

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "20px",
        marginTop: "20px",
      }}
    >
      <h3>✍️ Sign Message</h3>

      <button onClick={handleSign}>
        Sign Message
      </button>

      {signature && (
        <>
          <p>
            <strong>Signature</strong>
          </p>

          <textarea
            readOnly
            value={signature}
            rows={6}
            style={{ width: "100%" }}
          />
        </>
      )}
    </div>
  );
}
