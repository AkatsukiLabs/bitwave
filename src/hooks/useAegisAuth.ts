import { useState, useEffect } from 'react';
import { useAegis } from '@cavos/aegis';

/**
 * Hook simplificado para manejar autenticación con Aegis SDK
 * Versión simplificada que evita bucles infinitos
 */
export const useAegisAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Usar el hook de Aegis de forma segura
  let aegisAccount: any = null;
  let isWalletConnected = false;
  let sdkInitialized = false;

  try {
    const aegisHook = useAegis();
    aegisAccount = aegisHook.aegisAccount;
    isWalletConnected = aegisHook.isWalletConnected;
    sdkInitialized = true;
  } catch (err) {
    console.warn('Aegis SDK initialization error:', err);
    setError('Error inicializando el SDK de Aegis');
  }


  /**
   * Conectar wallet existente
   */
  const connectWallet = async (privateKey: string) => {
    if (!aegisAccount) {
      throw new Error('Aegis SDK no está inicializado');
    }

    try {
      setIsLoading(true);
      setError(null);

      await aegisAccount.connectAccount(privateKey);
      
      // Guardar la clave privada
      localStorage.setItem('bitwave_wallet_key', privateKey);
      
      return { success: true };
    } catch (err) {
      console.error('Error connecting wallet:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al conectar wallet';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login con email y contraseña
   */
  const loginWithEmail = async (email: string, password: string) => {
    if (!aegisAccount) {
      throw new Error('Aegis SDK no está inicializado');
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await aegisAccount.signIn(email, password);
      
      // Log completo de la respuesta del login
      console.log('=== EMAIL LOGIN RESULT ===');
      console.log('Full login response:', result);
      console.log('Login success:', result?.success);
      console.log('User data:', result?.data);
      console.log('User ID:', result?.data?.user_id);
      console.log('Email:', result?.data?.email);
      console.log('Organization:', result?.data?.organization);
      console.log('Wallet status:', result?.data?.walletStatus);
      console.log('Auth data:', result?.data?.authData);
      console.log('==========================');
      
      return { success: true };
    } catch (err) {
      console.error('Error logging in with email:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Registro con email y contraseña
   */
  const signUpWithEmail = async (email: string, password: string) => {
    if (!aegisAccount) {
      throw new Error('Aegis SDK no está inicializado');
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await aegisAccount.signUp(email, password);
      
      // Log completo de la respuesta del registro
      console.log('=== EMAIL REGISTRATION RESULT ===');
      console.log('Full registration response:', result);
      console.log('Registration success:', result?.success);
      console.log('User data:', result?.data);
      console.log('User ID:', result?.data?.user_id);
      console.log('Email:', result?.data?.email);
      console.log('Organization:', result?.data?.organization);
      console.log('Wallet status:', result?.data?.walletStatus);
      console.log('Auth data:', result?.data?.authData);
      console.log('==================================');
      
      // Si el registro fue exitoso, hacer login automáticamente
      if (result && result.success) {
        console.log('Registration successful, proceeding to login...');
        
        // Intentar hacer login automáticamente
        try {
          await aegisAccount.signIn(email, password);
          console.log('Auto-login successful after registration');
        } catch (loginErr) {
          console.warn('Auto-login failed, user will need to login manually:', loginErr);
          // No es un error crítico, el usuario puede hacer login manualmente
        }
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error signing up with email:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al registrarse';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login con Apple (OAuth)
   */
  const loginWithApple = async () => {
    if (!aegisAccount) {
      throw new Error('Aegis SDK no está inicializado');
    }

    try {
      setIsLoading(true);
      setError(null);

      const redirectUrl = 'http://localhost:8080/auth/callback';
      const authUrl = await aegisAccount.getAppleOAuthUrl(redirectUrl);
      
      console.log('=== APPLE SIGN-IN INITIATED ===');
      console.log('Apple OAuth URL:', authUrl);
      console.log('Redirect URL:', redirectUrl);
      console.log('===============================');
      
      // Redirigir directamente a Apple OAuth
      window.location.href = authUrl;
      
      return { success: true };
    } catch (err) {
      console.error('Error logging in with Apple:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión con Apple';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login con Google (OAuth)
   */
  const loginWithGoogle = async () => {
    if (!aegisAccount) {
      throw new Error('Aegis SDK no está inicializado');
    }

    try {
      setIsLoading(true);
      setError(null);

      const redirectUrl = 'http://localhost:8080/auth/callback';
      const authUrl = await aegisAccount.getGoogleOAuthUrl(redirectUrl);
      
      console.log('=== GOOGLE SIGN-IN INITIATED ===');
      console.log('Google OAuth URL:', authUrl);
      console.log('Redirect URL:', redirectUrl);
      console.log('================================');
      
      // Redirigir directamente a Google OAuth
      window.location.href = authUrl;
      
      return { success: true };
    } catch (err) {
      console.error('Error logging in with Google:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión con Google';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (aegisAccount) {
        await aegisAccount.signOut();
      }

      // Limpiar datos locales
      localStorage.removeItem('bitwave_wallet_key');
      localStorage.removeItem('bitwave_auth_token');

      return { success: true };
    } catch (err) {
      console.error('Error logging out:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al cerrar sesión';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cargar wallet guardada al iniciar la app
   */
  const loadSavedWallet = async () => {
    const savedKey = localStorage.getItem('bitwave_wallet_key');
    if (savedKey && aegisAccount) {
      try {
        await connectWallet(savedKey);
        return true;
      } catch (err) {
        console.error('Error loading saved wallet:', err);
        // Limpiar clave inválida
        localStorage.removeItem('bitwave_wallet_key');
        return false;
      }
    }
    return false;
  };

  return {
    // Estado
    isWalletConnected,
    isLoading,
    error,
    sdkInitialized,
    aegisAccount, // Exponer aegisAccount para acceso directo
    
    // Métodos de autenticación
    connectWallet,
    loginWithEmail,
    signUpWithEmail,
    loginWithApple,
    loginWithGoogle,
    logout,
    loadSavedWallet,
    
    // Utilidades
    clearError: () => setError(null),
  };
};