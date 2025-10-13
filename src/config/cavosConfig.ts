/**
 * Cavos & Dojo Network Configuration for Bitwave
 */

// Network configuration from environment
// Maps VITE_AEGIS_NETWORK (SN_MAINNET/SN_SEPOLIA) to lowercase (mainnet/sepolia)
const aegisNetwork = import.meta.env.VITE_AEGIS_NETWORK || 'SN_MAINNET';
export const network = aegisNetwork === 'SN_MAINNET' ? 'SN_MAINNET' : 'SN_SEPOLIA';

// App ID from environment (frontend)
export const appId = import.meta.env.VITE_AEGIS_APP_ID;

// API Secret from environment (backend only)
export const apiSecret = import.meta.env.VITE_AEGIS_API_SECRET;

// Dojo URLs from environment
export const nodeUrl = import.meta.env.VITE_PUBLIC_NODE_URL || 'https://api.cartridge.gg/x/starknet/mainnet';
export const toriiUrl = import.meta.env.VITE_PUBLIC_TORII || 'https://api.cartridge.gg/x/bitwave1/torii';

// Debug environment variables
console.log('🔧 Cavos Config Debug:', {
  network,
  apiSecret: apiSecret ? 'LOADED' : 'MISSING',
  appId: appId ? 'LOADED' : 'MISSING',
  nodeUrl: nodeUrl ? 'LOADED' : 'MISSING',
  toriiUrl: toriiUrl ? 'LOADED' : 'MISSING'
});

// Chain verification
console.log(`⛓️ Current Chain: ${network.toUpperCase()} 🌐`);

// Contract addresses from manifest_mainnet.json
export const CONTRACT_ADDRESSES = {
  world: '0x42063b03f09bae8004ddb2011c87ff69cc1b7c98ec1bc94091a54136bec5ae3',
  game: '0x72e543a0ed77ede60e9b687a64071555382ba5826c6f3501f9c08ef87745f9b',
  player: '0x4e7976149b558e24c4039a31db010516f91484415cab1b6a41ec9fa4bf2d47f',
  minigameScore: '0x2a48b80384056e198cf11ce502238951255ba63cd28aa80d724abc48775e54f'
};

// Get contract addresses
export const getContractAddresses = () => {
  console.log('🎯 Contract Addresses:', {
    network,
    worldAddress: CONTRACT_ADDRESSES.world
  });

  return CONTRACT_ADDRESSES;
};
