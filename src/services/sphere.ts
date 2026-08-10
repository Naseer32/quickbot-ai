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
return result.client.query("sphere_resolve", { nametag: tag });
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
return result.client.intent("send", { identifier: to, amount, symbol });
}
