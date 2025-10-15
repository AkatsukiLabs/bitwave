import mainnetManifest from "../config/manifest_mainnet.json";
import sepoliaManifest from "../config/manifest_sepolia.json";
import { network } from "./cavosConfig";

// Export the correct manifest based on network configuration
export const manifest = network === 'SN_MAINNET' ? mainnetManifest : sepoliaManifest;

export type Manifest = typeof manifest;
