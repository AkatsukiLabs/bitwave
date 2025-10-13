import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAegis } from '@cavos/aegis';
import { usePlayerInitialization } from '@/hooks/usePlayerInitialization';

/**
 * Página de callback para manejar el retorno de OAuth (Google/Apple)
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const { aegisAccount } = useAegis();
  const { initializePlayer, isInitializing } = usePlayerInitialization();
  const [status, setStatus] = useState<string>('Procesando autenticación...');

  useEffect(() => {
    let isProcessing = false;

    const handleOAuthCallback = async () => {
      // Prevent multiple executions
      if (isProcessing) {
        console.log('⚠️ OAuth callback already processing, skipping...');
        return;
      }

      try {
        isProcessing = true;

        console.log('=== OAUTH CALLBACK HANDLER ===');
        console.log('Current URL:', window.location.href);
        console.log('URL search params:', window.location.search);
        console.log('URL hash:', window.location.hash);
        console.log('==============================');

        // Obtener la URL completa para el callback
        const callbackUrl = window.location.href;

        if (!aegisAccount) {
          console.error('Aegis account not available for callback');
          navigate("/auth");
          return;
        }

        console.log('Processing OAuth callback...');

        // Manejar el callback de OAuth
        await aegisAccount.handleOAuthCallback(callbackUrl);

        console.log('=== OAUTH CALLBACK SUCCESS ===');
        console.log('OAuth callback processed successfully');
        console.log('User authenticated via OAuth');
        console.log('===============================');

        // Guardar token de autenticación
        localStorage.setItem("bitwave_auth_token", "oauth_auth_token_" + Date.now());

        // Initialize player (check if exists or spawn new)
        setStatus('Inicializando jugador...');
        const success = await initializePlayer();

        if (success) {
          // Redirigir al home
          navigate("/home");
        } else {
          console.error('Failed to initialize player');
          navigate("/auth");
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        // Redirigir a auth en caso de error
        navigate("/auth");
      }
    };

    // Only run once when component mounts
    handleOAuthCallback();

    // Cleanup to prevent re-runs
    return () => {
      isProcessing = false;
    };
  }, []); // Empty deps - run only once

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          {status}
        </h1>
        <p className="text-muted-foreground">
          Por favor espera mientras completamos tu {isInitializing ? 'configuración' : 'autenticación'}.
        </p>
        <div className="mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bitwave-orange mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;