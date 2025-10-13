# Guía Completa de Integración de Cavos SDK

## 📋 Tabla de Contenidos
1. [Introducción](#introducción)
2. [Instalación y Configuración](#instalación-y-configuración)
3. [Estructura de Archivos](#estructura-de-archivos)
4. [Configuración Inicial](#configuración-inicial)
5. [Sistema de Autenticación](#sistema-de-autenticación)
6. [Hooks Personalizados](#hooks-personalizados)
7. [Gestión de Estado con Zustand](#gestión-de-estado-con-zustand)
8. [Autenticación con Google OAuth](#autenticación-con-google-oauth)
9. [Ejecución de Transacciones](#ejecución-de-transacciones)
10. [Implementación Paso a Paso](#implementación-paso-a-paso)

## Introducción

Esta guía detalla la integración completa de Cavos SDK en un proyecto React/TypeScript, incluyendo autenticación con Google OAuth, gestión de wallets y ejecución de transacciones en contratos de Starknet.

## Instalación y Configuración

### 1. Instalación del SDK

```bash
npm install cavos-service-sdk@^1.2.34
# o
yarn add cavos-service-sdk@^1.2.34
```

### 2. Variables de Entorno

Crear archivo `.env` con las siguientes variables:

```env
# Cavos Configuration
VITE_CAVOS_APP_ID=tu_app_id_de_cavos
VITE_CAVOS_ORG_SECRET=tu_org_secret_de_cavos
VITE_CAVOS_DEFAULT_NETWORK=sepolia  # o mainnet
```

## Estructura de Archivos

```
src/
├── config/
│   └── cavosConfig.ts           # Configuración central de Cavos
├── dojo/hooks/
│   ├── useCavosAuth.tsx        # Hook de autenticación
│   ├── useCavosAccount.tsx     # Hook para obtener cuenta
│   └── useCavosTransaction.tsx # Hook para transacciones
├── zustand/
│   └── store.ts                # Estado global con Zustand
├── components/
│   └── auth/
│       ├── BrowserLoginModal.tsx # Modal de login con Google
│       └── AuthCallback.tsx      # Callback OAuth
└── app/
    └── App.tsx                   # Configuración de rutas

```

## Configuración Inicial

### `client/src/config/cavosConfig.ts`

```typescript
// Network configuration
export const network = import.meta.env.VITE_CAVOS_DEFAULT_NETWORK === 'mainnet' ? 'mainnet' : 'sepolia';

// Organization secret from environment (backend only)
export const orgSecret = import.meta.env.VITE_CAVOS_ORG_SECRET;

// App ID from environment (frontend)
export const appId = import.meta.env.VITE_CAVOS_APP_ID;

// Debug environment variables
console.log('🔧 Cavos Config Debug:', {
  network,
  orgSecret: orgSecret ? 'LOADED' : 'MISSING',
  appId: import.meta.env.VITE_CAVOS_APP_ID ? 'LOADED' : 'MISSING',
  networkRaw: import.meta.env.VITE_CAVOS_DEFAULT_NETWORK
});

// Contract addresses per network
export const CONTRACT_ADDRESSES = {
  mainnet: {
    world: '0x79b0f0159ae6655ace0db5efc04f261340dc3e6f22e59c0b46237b5e9ced055',
    player: '0x38e837b4e9e5f2c08acecca5c464740d2fd35fb500b0914a4962e8d59ee0d8b',
    game: '0x2d4ac6b623b25e2af63b861ee1fc7c7a41d135f9d29577cb4e6f6a934c0564d',
    achieve: '0x44c537565cd0b4e571614b3491fc949889cbcf0b14e17789357260cae2efff1'
  },
  sepolia: {
    world: '0x1e87c289aacc73a6b5ac33688097cc13de58b7b5da2168573bd610e859fd9a9',
    player: '0x5e79b9650cb00d19d21601c9c712654cb13daa3007fd78cce0e90051e46ec8a',
    game: '0x8efc9411c660ef584995d8f582a13cac41aeddb6b9245b4715aa1e9e6a201e',
    achieve: '0x6846e1d528421a1569e36a3f80613f77e0d9f927e50967ada831347513f4c85'
  }
};

// Get contract addresses for current network
export const getContractAddresses = () => {
  return CONTRACT_ADDRESSES[network];
};
```

## Sistema de Autenticación

### Hook `useCavosAuth`

El hook principal para manejar la autenticación con Cavos:

```typescript
import { useEffect, useMemo } from 'react';
import { CavosAuth } from 'cavos-service-sdk';
import { network, orgSecret, appId } from '../../config/cavosConfig';
import useAppStore from '../../zustand/store';

interface UseCavosAuthReturn {
  user: any;
  wallet: any;
  loading: boolean;
  error: string | null;
  address?: string;
  handleRegister: () => Promise<void>;
  handleLogin: () => Promise<void>;
  handleDisconnect: () => void;
  isConnected: boolean;
}

export function useCavosAuth(): UseCavosAuthReturn {
  const {
    cavos,
    setCavosAuth,
    setCavosLoading,
    setCavosError,
    clearCavosAuth
  } = useAppStore();

  // Crear instancia de CavosAuth
  const cavosAuth = useMemo(() => {
    return new CavosAuth(network, appId);
  }, []);

  // Registro con email y contraseña
  const handleRegister = async () => {
    setCavosLoading(true);
    setCavosError(null);
    
    try {
      const result = await cavosAuth.signUp(
        email,
        password,
        orgSecret
      );
      
      // Extraer datos de la respuesta
      const userData = {
        email: result.data?.email,
        user_id: result.data?.user_id,
        organization: result.data?.organization,
        user_metadata: result.data?.user_metadata,
        created_at: result.data?.created_at
      };
      
      const walletData = result.data?.wallet;
      const accessToken = result.data?.authData?.accessToken;
      const refreshToken = result.data?.authData?.refreshToken;
      
      // Actualizar store con datos de autenticación
      setCavosAuth(userData, walletData, accessToken, refreshToken);
      
    } catch (error) {
      setCavosError(error.message);
    }
  };

  // Login con credenciales existentes
  const handleLogin = async () => {
    setCavosLoading(true);
    setCavosError(null);
    
    try {
      const result = await cavosAuth.signIn(
        email,
        password,
        orgSecret
      );
      
      // Procesar respuesta igual que en registro
      const userData = {
        email: result.data?.email,
        user_id: result.data?.user_id,
        organization: result.data?.organization,
        user_metadata: result.data?.user_metadata,
        created_at: result.data?.created_at
      };
      
      const walletData = result.data?.wallet;
      const accessToken = result.data?.authData?.accessToken;
      const refreshToken = result.data?.authData?.refreshToken;
      
      setCavosAuth(userData, walletData, accessToken, refreshToken);
      
    } catch (error) {
      // Si falla el login, intentar registro automático
      await handleRegister();
    }
  };

  const handleDisconnect = () => {
    clearCavosAuth();
  };

  return {
    user: cavos.user,
    wallet: cavos.wallet,
    loading: cavos.loading,
    error: cavos.error,
    address: cavos.wallet?.address || undefined,
    handleRegister,
    handleLogin,
    handleDisconnect,
    isConnected: cavos.isAuthenticated
  };
}
```

## Hooks Personalizados

### Hook `useCavosAccount`

Obtiene la dirección de la wallet actual:

```typescript
import { network } from '../../config/cavosConfig';

export function useCavosAccount() {
  // Obtener dirección desde localStorage o store
  const getAddress = (): string | undefined => {
    try {
      const storedAuth = localStorage.getItem('cavos_auth_data');
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        return authData.wallet?.address;
      }
    } catch {
      return undefined;
    }
    return undefined;
  };

  const address = getAddress();
  const isConnected = !!address;

  const account = address ? {
    address,
    chainId: network === 'mainnet' ? 'SN_MAIN' : 'SN_SEPOLIA',
  } : undefined;

  return {
    address,
    account,
    isConnected,
    status: isConnected ? 'connected' : 'disconnected'
  };
}
```

### Hook `useCavosTransaction`

Ejecuta transacciones en contratos:

```typescript
import { useState, useMemo } from 'react';
import { CavosAuth } from 'cavos-service-sdk';
import { network, appId } from '../../config/cavosConfig';
import useAppStore from '../../zustand/store';

interface CavosTransactionCall {
  contractAddress: string;
  entrypoint: string;
  calldata: string[];
}

interface UseCavosTransactionReturn {
  executeTransaction: (calls: CavosTransactionCall[]) => Promise<string>;
  loading: boolean;
  error: string | null;
}

export function useCavosTransaction(): UseCavosTransactionReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setCavosTokens } = useAppStore();

  const cavosAuth = useMemo(() => {
    return new CavosAuth(network, appId);
  }, []);

  const executeTransaction = async (calls: CavosTransactionCall[]): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      // Obtener estado actual desde store
      const currentState = useAppStore.getState();
      const currentCavos = currentState.cavos;
      
      if (!currentCavos.isAuthenticated || !currentCavos.accessToken || !currentCavos.wallet) {
        throw new Error('Not authenticated. Please login first.');
      }

      // Ejecutar transacción usando SDK
      const result = await cavosAuth.executeCalls(
        currentCavos.wallet.address,
        calls,
        currentCavos.accessToken
      );

      // Manejar errores en la respuesta
      if (result && typeof result === 'object' && result.error) {
        throw new Error(`Transaction failed: ${result.error}`);
      }

      // Extraer hash de transacción
      const transactionHash = result?.txHash || result?.transaction_hash || result;
      
      if (!transactionHash || typeof transactionHash !== 'string') {
        throw new Error('No valid transaction hash returned');
      }

      // Actualizar token si se recibe uno nuevo
      if (result?.accessToken) {
        setCavosTokens(result.accessToken, currentCavos.refreshToken);
      }

      return transactionHash;

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    executeTransaction,
    loading,
    error
  };
}
```

## Gestión de Estado con Zustand

### Store Configuration

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CavosUser {
  email: string;
  user_id: string;
  [key: string]: any;
}

interface CavosWallet {
  address: string;
  network: string;
  private_key?: string;
  public_key?: string;
  [key: string]: any;
}

interface CavosAuthState {
  user: CavosUser | null;
  wallet: CavosWallet | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface AppStore {
  cavos: CavosAuthState;
  
  // Acciones de Cavos
  setCavosAuth: (
    user: CavosUser | null, 
    wallet: CavosWallet | null, 
    accessToken: string | null, 
    refreshToken: string | null
  ) => void;
  setCavosTokens: (accessToken: string | null, refreshToken: string | null) => void;
  setCavosLoading: (loading: boolean) => void;
  setCavosError: (error: string | null) => void;
  clearCavosAuth: () => void;
}

const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // Estado inicial de Cavos
      cavos: {
        user: null,
        wallet: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      },
      
      // Implementación de acciones
      setCavosAuth: (user, wallet, accessToken, refreshToken) => {
        set((state) => ({
          cavos: {
            ...state.cavos,
            user,
            wallet,
            accessToken,
            refreshToken,
            isAuthenticated: !!(user && wallet && accessToken),
            error: null
          }
        }));
      },
      
      setCavosTokens: (accessToken, refreshToken) => {
        set((state) => ({
          cavos: {
            ...state.cavos,
            accessToken,
            refreshToken
          }
        }));
      },
      
      setCavosLoading: (loading) => {
        set((state) => ({
          cavos: {
            ...state.cavos,
            loading
          }
        }));
      },
      
      setCavosError: (error) => {
        set((state) => ({
          cavos: {
            ...state.cavos,
            error,
            loading: false
          }
        }));
      },
      
      clearCavosAuth: () => {
        set((state) => ({
          cavos: {
            user: null,
            wallet: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            loading: false,
            error: null
          }
        }));
      }
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        cavos: state.cavos
      })
    }
  )
);

export default useAppStore;
```

## Autenticación con Google OAuth

### 1. Modal de Login con Google

```typescript
import React, { useRef } from 'react';
import { SignInWithGoogle } from 'cavos-service-sdk';

interface BrowserLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleLogin: () => void;
  isLoading?: boolean;
}

export const BrowserLoginModal: React.FC<BrowserLoginModalProps> = ({
  isOpen,
  onClose,
  onGoogleLogin,
  isLoading = false
}) => {
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const handleGoogleClick = () => {
    // Hacer clic en el botón oculto de Cavos
    const cavosButton = googleButtonRef.current?.querySelector('button');
    if (cavosButton) {
      cavosButton.click();
    } else {
      onGoogleLogin();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Sign In</h2>
        
        {/* Componente Cavos oculto */}
        <div ref={googleButtonRef} style={{ position: 'absolute', left: '-9999px' }}>
          <SignInWithGoogle
            appId={import.meta.env.VITE_CAVOS_APP_ID || ""}
            network={import.meta.env.VITE_CAVOS_DEFAULT_NETWORK || "mainnet"}
            finalRedirectUri={`${window.location.origin}/auth/callback`}
            text="Continue with Google"
          />
        </div>
        
        {/* Botón personalizado */}
        <button
          onClick={handleGoogleClick}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded hover:bg-blue-600"
          disabled={isLoading}
        >
          <div className="flex items-center justify-center gap-3">
            <GoogleIcon />
            <span>Continue with Google</span>
          </div>
        </button>
      </div>
    </div>
  );
};
```

### 2. Callback de OAuth

```typescript
import React, { useEffect, useState } from 'react';
import useAppStore from '../../../zustand/store';

interface AuthCallbackProps {
  onAuthComplete: (success: boolean, data?: any) => void;
}

export const AuthCallback: React.FC<AuthCallbackProps> = ({ onAuthComplete }) => {
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("Processing authentication...");
  const setCavosAuth = useAppStore(state => state.setCavosAuth);

  useEffect(() => {
    const handleCallback = () => {
      try {
        // Obtener parámetros de URL
        const urlParams = new URLSearchParams(window.location.search);
        const userData = urlParams.get("user_data");
        const error = urlParams.get("error");

        // Manejar errores
        if (error) {
          setStatus("error");
          setMessage(`Authentication failed: ${error}`);
          setTimeout(() => onAuthComplete(false), 3000);
          return;
        }

        // Procesar datos del usuario
        if (userData) {
          const decodedUserData = decodeURIComponent(userData);
          const parsedUserData = JSON.parse(decodedUserData);
          
          // Extraer datos necesarios para Cavos
          const cavosUser = {
            email: parsedUserData.email || 'google-user@example.com',
            user_id: parsedUserData.user_id || parsedUserData.id,
            organization: parsedUserData.organization,
            user_metadata: parsedUserData.user_metadata || {},
            created_at: parsedUserData.created_at || new Date().toISOString()
          };
          
          const cavosWallet = parsedUserData.wallet || {
            address: parsedUserData.wallet_address,
            network: parsedUserData.network || 'sepolia'
          };
          
          const accessToken = parsedUserData.authData?.accessToken || parsedUserData.access_token;
          const refreshToken = parsedUserData.authData?.refreshToken || parsedUserData.refresh_token;
          
          // Actualizar estado de autenticación
          setCavosAuth(cavosUser, cavosWallet, accessToken, refreshToken);
          
          // Mostrar éxito y redirigir
          setStatus("success");
          setMessage("Authentication successful!");
          setTimeout(() => onAuthComplete(true, parsedUserData), 1500);
          
        } else {
          setStatus("error");
          setMessage("No authentication data received");
          setTimeout(() => onAuthComplete(false), 3000);
        }
      } catch (error) {
        console.error('Callback processing error:', error);
        setStatus("error");
        setMessage("An error occurred during authentication");
        setTimeout(() => onAuthComplete(false), 3000);
      }
    };

    setTimeout(handleCallback, 100);
  }, [onAuthComplete, setCavosAuth]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6">
        {status === "processing" && <div className="animate-spin">⏳</div>}
        {status === "success" && <div>✅</div>}
        {status === "error" && <div>❌</div>}
        <p>{message}</p>
      </div>
    </div>
  );
};
```

### 3. Configuración de Rutas

```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthCallback } from './auth/callback/AuthCallback';
import { MainApp } from './MainApp';

function App() {
  const handleAuthComplete = (success: boolean, data?: any) => {
    if (success) {
      // Redirigir a la aplicación principal
      window.location.href = '/';
    } else {
      // Manejar error
      console.error('Authentication failed');
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route 
          path="/auth/callback" 
          element={<AuthCallback onAuthComplete={handleAuthComplete} />} 
        />
      </Routes>
    </Router>
  );
}
```

## Ejecución de Transacciones

### Ejemplo de Uso

```typescript
import { useCavosTransaction } from './hooks/useCavosTransaction';
import { getContractAddresses } from './config/cavosConfig';

function GameComponent() {
  const { executeTransaction, loading, error } = useCavosTransaction();
  const contractAddresses = getContractAddresses();

  const handleGameAction = async () => {
    try {
      // Preparar llamadas al contrato
      const calls = [
        {
          contractAddress: contractAddresses.game,
          entrypoint: 'feed_beast',
          calldata: [
            '0x1234', // beast_id
            '0x5'     // food_type
          ]
        }
      ];

      // Ejecutar transacción
      const txHash = await executeTransaction(calls);
      console.log('Transaction successful:', txHash);
      
      // Esperar confirmación o actualizar UI
      
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  return (
    <div>
      <button 
        onClick={handleGameAction} 
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Feed Beast'}
      </button>
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

## Implementación Paso a Paso

### Paso 1: Configuración Inicial

1. **Instalar dependencias:**
```bash
npm install cavos-service-sdk zustand
```

2. **Configurar variables de entorno:**
```env
VITE_CAVOS_APP_ID=tu_app_id
VITE_CAVOS_ORG_SECRET=tu_org_secret
VITE_CAVOS_DEFAULT_NETWORK=sepolia
```

### Paso 2: Crear Archivo de Configuración

Crear `src/config/cavosConfig.ts` con la configuración de red y contratos.

### Paso 3: Implementar Store con Zustand

Crear `src/zustand/store.ts` con el estado global para Cavos.

### Paso 4: Crear Hooks Personalizados

1. `useCavosAuth.tsx` - Manejo de autenticación
2. `useCavosAccount.tsx` - Obtener información de cuenta
3. `useCavosTransaction.tsx` - Ejecutar transacciones

### Paso 5: Implementar UI de Login

1. Crear componente `BrowserLoginModal.tsx`
2. Integrar componente `SignInWithGoogle` de Cavos SDK
3. Personalizar estilos según diseño

### Paso 6: Configurar Callback de OAuth

1. Crear componente `AuthCallback.tsx`
2. Configurar ruta `/auth/callback` en router
3. Procesar respuesta de OAuth y actualizar store

### Paso 7: Integrar en Aplicación

```typescript
import { useCavosAuth } from './hooks/useCavosAuth';
import { BrowserLoginModal } from './components/BrowserLoginModal';

function App() {
  const { isConnected, handleLogin, user, wallet } = useCavosAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  if (!isConnected) {
    return (
      <>
        <button onClick={() => setShowLoginModal(true)}>
          Connect Wallet
        </button>
        <BrowserLoginModal 
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onGoogleLogin={handleLogin}
        />
      </>
    );
  }

  return (
    <div>
      <p>Connected: {user?.email}</p>
      <p>Wallet: {wallet?.address}</p>
      {/* Resto de la aplicación */}
    </div>
  );
}
```

### Paso 8: Ejecutar Transacciones

```typescript
const { executeTransaction } = useCavosTransaction();

// Ejemplo de transacción
const txHash = await executeTransaction([
  {
    contractAddress: '0x123...',
    entrypoint: 'transfer',
    calldata: ['0x456...', '1000']
  }
]);
```

## Notas Importantes

### Seguridad
- **NUNCA** exponer `VITE_CAVOS_ORG_SECRET` en el frontend en producción
- Usar HTTPS en producción para OAuth
- Validar todos los datos recibidos del callback

### Manejo de Errores
- Implementar retry logic para transacciones fallidas
- Manejar expiración de tokens con refresh tokens
- Mostrar mensajes de error claros al usuario

### Optimizaciones
- Persistir estado de autenticación con Zustand persist
- Implementar caché para datos de wallet
- Usar lazy loading para componentes de autenticación

### Testing
- Usar network `sepolia` para desarrollo
- Crear usuarios de prueba para testing
- Verificar transacciones en explorer de Starknet

## Troubleshooting

### Problemas Comunes

1. **"CAVOS_APP_ID not found"**
   - Verificar que las variables de entorno estén configuradas
   - Reiniciar servidor de desarrollo después de cambiar .env

2. **"Authentication failed"**
   - Verificar que el `finalRedirectUri` coincida con la configuración en Cavos Dashboard
   - Asegurar que el dominio esté autorizado en Google OAuth

3. **"Transaction failed"**
   - Verificar que el usuario tenga fondos suficientes
   - Confirmar que las direcciones de contratos sean correctas para la red actual
   - Revisar que los calldata estén en el formato correcto

4. **"Token expired"**
   - Implementar lógica de refresh token
   - Manejar re-autenticación automática

## Recursos Adicionales

- [Documentación de Cavos SDK](https://docs.cavos.io)
- [Starknet Documentation](https://docs.starknet.io)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)

## Conclusión

Esta implementación proporciona:
- ✅ Autenticación completa con Google OAuth
- ✅ Gestión de wallets de Starknet
- ✅ Ejecución de transacciones en contratos
- ✅ Estado persistente con Zustand
- ✅ Manejo de errores y tokens
- ✅ UI personalizable

Con esta guía, deberías poder integrar Cavos SDK completamente en tu proyecto y manejar toda la autenticación y transacciones necesarias.