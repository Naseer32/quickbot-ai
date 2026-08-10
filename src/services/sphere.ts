import { Sphere } from "@unicitylabs/sphere-sdk";
import { createBrowserProviders } from "@unicitylabs/sphere-sdk/impl/browser";
import { createWalletApiProviders } from "@unicitylabs/sphere-sdk/impl/shared/wallet-api";

let sphere: any = null;

export async function connectWallet() {
  if (sphere) return sphere;

  const base = createBrowserProviders({
    network: "testnet",
    oracle: {
      apiKey: "sk_ddc3cfcc001e4a28ac3fad7407f99590",
    },
  });

  const providers = createWalletApiProviders(base, {
    baseUrl: "https://wallet-api.unicity.network",
    network: "testnet2",
    deviceId: "quickbot-ai-device",
  });

  const result = await Sphere.init({
    ...providers,
    autoGenerate: true,
  });

  sphere = result.sphere;

  return sphere;
}

export async function resolveTag(tag: string) {
  const wallet = await connectWallet();

  const cleanTag = tag.startsWith("@") ? tag : `@${tag}`;

  return wallet.query("sphere_resolve", {
    identifier: cleanTag,
  });
}

export async function getAssets() {
  const wallet = await connectWallet();

  return wallet.payments.assets();
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
  const wallet = await connectWallet();

  const cleanRecipient = to.startsWith("@") ? to : `@${to}`;

  if (symbol.toUpperCase() !== "UCT") {
    throw new Error(`Unsupported testnet coin: ${symbol}`);
  }

  console.log("Sending:", {
    recipient: cleanRecipient,
    amount: String(amount),
    coinId: "UCT",
  });

  return wallet.payments.send({
    recipient: cleanRecipient,
    amount: String(amount),
    coinId: "UCT",
  });
}
