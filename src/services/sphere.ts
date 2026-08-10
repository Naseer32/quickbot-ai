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

  return result.client.query("sphere_resolve", {
    identifier: tag,
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

  const coinId = getCoinIdBySymbol(symbol.toUpperCase());

  if (!coinId) {
    throw new Error(`Could not find coin ID for ${symbol}.`);
  }

  console.log("Sending with:", {
    to,
    amount,
    symbol,
    coinId,
  });

  return result.client.intent("send", {
    to,
    amount: String(amount),
    coinId,
  });
}
