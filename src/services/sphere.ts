import { Sphere } from "@unicitylabs/sphere-sdk";

let sphere: Sphere | null = null;

export async function initSphere() {
  if (sphere) return sphere;

  const result = await Sphere.init({
    network: "testnet",
  });

  sphere = result.sphere;

  return sphere;
}
