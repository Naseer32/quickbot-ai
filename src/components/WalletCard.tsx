import { useState } from "react";
import { connectWallet } from "../services/sphere";

export default function WalletCard() {
  const [status, setStatus] = useState("Not Connected");
  const [address, setAddress] = useState("--");
  const [connected, setConnected] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);

  async function handleConnectWallet() {
    try {
      setStatus("Connecting...");

      const result = await connectWallet();

      setAddress(result.connection.identity?.directAddress || "--");

const walletAssets = await result.client.query("sphere_getAssets");


setAssets(walletAssets);

// Automatically ask the wallet to sign
const signed = await result.client.intent("sign_message", {
  message: "Welcome to QuickBot AI",
});

console.log("Signature:", signed.signature);

// Ask wallet to sign
const signed = await result.client.intent("sign_message", {
  message: "Welcome to QuickBot AI",
});

      console.log("Signature:", signed.signature);

      // Get all wallet assets

      // Get balance for each asset using its coinId
      setAssets(walletAssets);

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
      setAssets([]);
    }
  }

  async function handleDisconnect() {
    try {
      const result = await connectWallet();

      await result.disconnect();

      setStatus("Not Connected");
      setAddress("--");
      setConnected(false);
      setAssets([]);
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

      {connected ? (
        <>
          <h4>Wallet Assets</h4>

          {assets.length === 0 ? (
            <p>No assets found.</p>
          ) : (
            assets.map((asset: any) => (
              <div
                key={asset.coinId}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "10px",
                  marginBottom: "10px",
                }}
              >
                <p>
                  <strong>Symbol:</strong> {asset.symbol}
                </p>

                <p>
  <strong>Balance:</strong>{" "}
  {Number(asset.confirmedAmount) / Math.pow(10, asset.decimals)} {asset.symbol}
</p>

                <p>
                  <strong>Coin ID:</strong> {asset.coinId}
                </p>
              </div>
            ))
          )}

          <button onClick={handleDisconnect}>
            Disconnect Wallet
          </button>
        </>
      ) : (
        <button onClick={handleConnectWallet}>
          Connect Wallet
        </button>
      )}
    </div>
  );
      }
