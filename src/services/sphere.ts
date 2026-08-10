import { getCoinIdBySymbol } from "@unicitylabs/sphere-sdk";
import { autoConnect } from "@unicitylabs/sphere-sdk/connect/browser";
import { SPHERE_NETWORKS } from "@unicitylabs/sphere-sdk/connect";

let connection: any = null;

export async function connectWallet() {
  if (connection) return connection;

  connection = await autoConnect({
    dapp: {
      name: "QuickBot AI",
      url: window.location.origin,
    },
    walletUrl: "https://sphere.unicity.network",
    network: SPHERE_NETWORKS.testnet2,
    silent: false,
  });

  return connection;
}

export async function resolveTag(tag: string) {
  const result = await connectWallet();

  const identifier = tag.startsWith("@") ? tag.slice(1) : tag;

  return result.client.query("sphere_resolve", {
    identifier,
  });
}

export async function sendAsset({
  to,
  amount,
  symbol,
}: {
  to: string;
  amount: number;
  symbol: string;
}) {
  const result = await connectWallet();

  if (!to) {
    throw new Error("Missing recipient address.");
  }

  if (!symbol) {
    throw new Error("Missing coin symbol.");
  }

  const normalizedSymbol = symbol.trim().toUpperCase();

  const coinId = getCoinIdBySymbol(normalizedSymbol);

  if (!coinId) {
    throw new Error(`Could not find coin ID for ${normalizedSymbol}.`);
  }

  console.log("QuickBot send:", {
    to,
    amount,
    symbol: normalizedSymbol,
    coinId,
  });

  return result.client.intent("send", {
    to,
    amount: String(Math.round(amount * 1_000_000)),
    coinId,
  });
}
