import { Sphere } from "@unicitylabs/sphere-sdk";
import { createBrowserProviders } from "@unicitylabs/sphere-sdk/impl/browser";
import { createWalletApiProviders } from "@unicitylabs/sphere-sdk/impl/shared/wallet-api";

let sphere: Sphere | null = null;

export async function getSphere() {
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

  if (result.created && result.generatedMnemonic) {
    alert(
      "Save your recovery phrase:\n\n" + result.generatedMnemonic
    );
  }

  sphere = result.sphere;
  return sphere;
}
