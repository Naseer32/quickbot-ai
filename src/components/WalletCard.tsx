import { useState } from "react";
import { connectWallet } from "../services/sphere";

export default function WalletCard() {
  const [status, setStatus] = useState("Not Connected");
  const [address, setAddress] = useState("--");
  const [connected, setConnected] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [walletName, setWalletName] = useState("");

  async function handleConnectWallet() {
    try {
      setStatus("Connecting...");

      const result = await connectWallet();

      setAddress(result.connection.identity?.directAddress || "--");

      const walletAssets = await result.client.query("sphere_getAssets");

console.log("walletAssets =", walletAssets);

alert(JSON.stringify(walletAssets, null, 2));

      const assetList = Array.isArray(walletAssets)
        ? walletAssets
        : walletAssets.assets ?? [];

      setAssets(assetList);

      const total = assetList.reduce(
        (sum: number, asset: any) => sum + (asset.fiatValueUsd || 0),
        0
      );

      setTotalValue(total);
      setWalletName(result.connection.identity?.directAddress || "--");

      // Automatically ask the wallet to sign
      const signed = await result.client.intent("sign_message", {
        message: "Welcome to QuickBot AI",
      });

      console.log("Signature:", signed.signature);

      setStatus("Connected ✅");
      setConnected(true);
    } catch (err: any) {
      console.error(err);

      alert(err?.message || JSON.stringify(err, null, 2) || "Unknown error");

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

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(address);
      alert("Address copied!");
    } catch {
      alert("Failed to copy address.");
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
  <strong>Address:</strong>{" "}
  {address === "--"
    ? "--"
    : `${address.slice(0, 18)}...${address.slice(-8)}`}
</p>

      <button
        onClick={copyAddress}
        style={{
          marginBottom: "20px",
        }}
      >
        📋 Copy Address
      </button>

      {connected ? (
        <>
          <h4>💰 Portfolio</h4>

          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "20px",
              background: "#f8f8f8",
            }}
          >
            <p>
              <strong>Total Value:</strong> $
              {totalValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>

            <p>
              <strong>Assets:</strong> {assets.length} Tokens
            </p>

            <p>
              <strong>Wallet:</strong>{" "}
              {walletName.length > 24
                ? walletName.slice(0, 18) + "..."
                : walletName}
            </p>
          </div>

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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <img
                    src={asset.iconUrl}
                    alt={asset.symbol}
                    width={32}
                    height={32}
                  />

                  <h4 style={{ margin: 0 }}>
                    {asset.name} ({asset.symbol})
                  </h4>
                </div>

                <p>
                  <strong>Balance:</strong>{" "}
                  {(
                    Number(asset.confirmedAmount) /
                    Math.pow(10, asset.decimals)
                  ).toLocaleString()}{" "}
                  {asset.symbol}
                </p>

                <p>
                  <strong>Value:</strong> $
                  {Number(asset.fiatValueUsd ?? 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>

                <p
                  style={{
                    color: (asset.change24h ?? 0) >= 0 ? "green" : "red",
                  }}
                >
                  <strong>24h:</strong>{" "}
                  {((asset.change24h ?? 0) * 100).toFixed(2)}%
                </p>
              </div>
            ))
          )}

          <button onClick={handleDisconnect}>Disconnect Wallet</button>
        </>
      ) : (
        <button onClick={handleConnectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}
