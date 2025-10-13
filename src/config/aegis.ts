/**
 * Configuración de Aegis SDK para Bitwave
 * 
 * IMPORTANTE: Necesitas obtener tu App ID de https://aegis.cavos.xyz
 * 
 * Esta configuración sigue el patrón del ejemplo oficial de aegis-sdk-example
 */

export const AEGIS_CONFIG = {
  /**
   * Tu App ID de Aegis - OBLIGATORIO
   * Obtén tu App ID en: https://aegis.cavos.xyz
   */
  appId: import.meta.env.VITE_AEGIS_APP_ID || 'demo-app-id',
  
  /**
   * Red de Starknet
   * - 'SN_SEPOLIA': Testnet (recomendado para desarrollo)
   * - 'SN_MAINNET': Red principal (para producción)
   */
  network: import.meta.env.VITE_AEGIS_NETWORK || 'SN_MAINNET',
  
  /**
   * Nombre de tu aplicación
   */
  appName: import.meta.env.VITE_AEGIS_APP_NAME || 'Bitwave Gaming Platform',
  
  /**
   * Habilitar logs de debug (solo para desarrollo)
   */
  enableLogging: import.meta.env.VITE_AEGIS_ENABLE_LOGGING === 'true' || import.meta.env.DEV,
  
  /**
   * API Key de AVNU para transacciones gasless (opcional)
   * Obtén tu key en: https://avnu.fi/
   */
  paymasterApiKey: import.meta.env.VITE_AEGIS_PAYMASTER_API_KEY || undefined,
  
  /**
   * URL de tracking personalizada (opcional)
   */
  trackingApiUrl: import.meta.env.VITE_AEGIS_TRACKING_API_URL || undefined,
};

/**
 * Configuración de tokens para Bitwave
 */
export const TOKEN_CONFIG = {
  /**
   * Dirección del contrato VESU token en Starknet
   * Reemplaza con la dirección real de tu token
   */
  VESU_TOKEN_ADDRESS: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d', // STRK como ejemplo
  
  /**
   * Decimales del token VESU
   */
  VESU_DECIMALS: 18,
  
  /**
   * Dirección del contrato de la tienda (opcional)
   * Para transacciones de compra de tokens
   */
  STORE_CONTRACT_ADDRESS: undefined, // Configurar cuando tengas el contrato
};

/**
 * URLs de redirección para OAuth
 * Ajusta según tu dominio de desarrollo/producción
 */
export const REDIRECT_URLS = {
  development: 'http://localhost:5173/auth/callback',
  production: 'https://tu-dominio.com/auth/callback',
};

/**
 * Función para obtener la URL de redirección correcta
 */
export const getRedirectUrl = () => {
  return import.meta.env.DEV 
    ? REDIRECT_URLS.development 
    : REDIRECT_URLS.production;
};