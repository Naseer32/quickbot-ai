import { useState } from "react";
import { connectWallet } from "../services/sphere";
import "../styles/wallet.css";

const ICON_FALLBACK: Record<string, { glyph: string; color: string; bg: string }> = {
  SOL: { glyph: "◎", color: "#A78BFA", bg: "rgba(167,139,250,0.18)" },
  ETH: { glyph: "Ξ", color: "#F4F6FF", bg: "rgba(244,246,255,0.10)" },
  BTC: { glyph: "₿", color: "#F8B150", bg: "rgba(248,177,80,0.18)" },
  UCT: { glyph: "U", color: "#6EE7B7", bg: "rgba(110,231,183,0.18)" },
};

const RING_POSITIONS = [
  { top: "6px", left: "104px" },
  { top: "104px", right: "2px" },
  { bottom: "14px", left: "70px" },
  { top: "60px", left: "6px" },
];

function formatBalance(confirmedAmount: any, decimals: number): string {
  const rawValue = Number(confirmedAmount) / Math.pow(10, decimals);
  return new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(rawValue);
}

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

      const cleanAddress =
        (result.connection.identity?.directAddress || "").replace(
          "DIRECT://",
          ""
        );

      setAddress(cleanAddress || "--");

      const walletAssets = await result.client.query("sphere_getAssets");

      console.log("walletAssets =", walletAssets);

      const assetList = Array.isArray(walletAssets)
        ? walletAssets
        : walletAssets.assets ?? [];

      setAssets(assetList);

      const total = assetList.reduce(
        (sum: number, asset: any) => sum + (asset.fiatValueUsd || 0),
        0
      );

      localStorage.setItem(
        "quickbot-wallet",
        JSON.stringify({
          address: cleanAddress,
          assets: assetList.map((asset: any) => ({
            symbol: asset.symbol,
            name: asset.name,
            balance:
              Number(asset.confirmedAmount) / Math.pow(10, asset.decimals),
            value: asset.fiatValueUsd ?? 0,
          })),
          totalValue: total,
        })
      );

      setTotalValue(total);
      setWalletName(cleanAddress || "--");

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

  function shortAddress(addr: string): string {
    if (!addr || addr === "--") return "--";
    return `${addr.slice(0, 10)}…${addr.slice(-8)}`;
  }

  return (
    <div className="qb-app">
      <div className="qb-eyebrow">Sphere · Testnet2</div>
      <h1 className="qb-h1">
        QuickBot AI
        <span>AI-powered Web3 assistant on Unicity Sphere</span>
      </h1>

      {!connected ? (
        <div className="qb-orbit-card">
          <div className="qb-orbit-wrap">
            <div className="qb-ring" />
            <div className="qb-ring r2" />
            <div className="qb-center-value">
              <div className="qb-label">Status</div>
              <div className="qb-val" style={{ fontSize: "18px" }}>
                {status}
              </div>
            </div>
          </div>

          <button
            onClick={handleConnectWallet}
            style={{
              marginTop: "18px",
              width: "100%",
              padding: "13px",
              borderRadius: "10px",
              border: "none",
              background: "var(--pulse)",
              color: "var(--void)",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <>
          <div className="qb-orbit-card">
            <div className="qb-orbit-wrap">
              <div className="qb-ring" />
              <div className="qb-ring r2" />

              {assets.slice(0, 4).map((asset, i) => {
                const color = ICON_FALLBACK[asset.symbol]?.color ?? "#8B93B8";
                return (
                  <div
                    key={asset.coinId ?? asset.symbol}
                    className="qb-node"
                    style={{ ...RING_POSITIONS[i], color, background: color }}
                  />
                );
              })}

              <div className="qb-center-value">
                <div className="qb-label">Total Value</div>
                <div className="qb-val">
                  $
                  {totalValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="qb-sub">{assets.length} assets</div>
              </div>
            </div>

            <div className="qb-status-row">
              <div className="qb-status">
                <span className="qb-dot" />
                {status}
              </div>
              <div className="qb-addr-chip" onClick={copyAddress}>
                {shortAddress(address)} ⧉
              </div>
            </div>
          </div>

          <div className="qb-section-label">
            <span>Wallet Assets</span>
            <span>Balance</span>
          </div>

          {assets.length === 0 ? (
            <p style={{ color: "var(--mist)", fontSize: "13px" }}>
              No assets found.
            </p>
          ) : (
            <div className="qb-ledger">
              {assets.map((asset: any) => {
                const fallback = ICON_FALLBACK[asset.symbol] ?? {
                  glyph: (asset.symbol ?? "?").slice(0, 1),
                  color: "#8B93B8",
                  bg: "rgba(139,147,184,0.15)",
                };
                const hasPrice =
                  asset.fiatValueUsd !== null &&
                  asset.fiatValueUsd !== undefined &&
                  asset.fiatValueUsd > 0;
                const changePct = (asset.change24h ?? 0) * 100;

                return (
                  <div className="qb-asset-row" key={asset.coinId ?? asset.symbol}>
                    {asset.iconUrl ? (
                      <img
                        src={asset.iconUrl}
                        alt={asset.symbol}
                        width={36}
                        height={36}
                        style={{ borderRadius: "10px", flexShrink: 0 }}
                      />
                    ) : (
                      <div
                        className="qb-asset-icon"
                        style={{ background: fallback.bg, color: fallback.color }}
                      >
                        {fallback.glyph}
                      </div>
                    )}

                    <div className="qb-asset-main">
                      <div className="qb-asset-name">{asset.name}</div>
                      <div className="qb-asset-sym">{asset.symbol}</div>
                    </div>

                    <div className="qb-asset-right">
                      <div className="qb-asset-balance">
                        {formatBalance(asset.confirmedAmount, asset.decimals)}{" "}
                        {asset.symbol}
                      </div>
                      {hasPrice ? (
                        <>
                          <div className="qb-asset-value">
                            $
                            {Number(asset.fiatValueUsd).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div
                            className={`qb-asset-change ${
                              changePct >= 0 ? "qb-up" : "qb-down"
                            }`}
                          >
                            {changePct >= 0 ? "▲" : "▼"}{" "}
                            {Math.abs(changePct).toFixed(2)}%
                          </div>
                        </>
                      ) : (
                        <div className="qb-asset-value qb-no-data">
                          No market data
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={handleDisconnect}
            style={{
              marginTop: "20px",
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--mist)",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Disconnect Wallet
          </button>
        </>
      )}
    </div>
  );
      }
                            
