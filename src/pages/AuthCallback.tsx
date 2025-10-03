import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAegis } from '@cavos/aegis';

/**
 * Página de callback para manejar el retorno de OAuth (Google/Apple)
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const { aegisAccount } = useAegis();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log('=== OAUTH CALLBACK HANDLER ===');
        console.log('Current URL:', window.location.href);
        console.log('URL search params:', window.location.search);
        console.log('URL hash:', window.location.hash);
        console.log('==============================');

        // Obtener la URL completa para el callback
        const callbackUrl = window.location.href;
        
        if (aegisAccount) {
          console.log('Processing OAuth callback...');
          
          // Manejar el callback de OAuth
          await aegisAccount.handleOAuthCallback(callbackUrl);
          
          console.log('=== OAUTH CALLBACK SUCCESS ===');
          console.log('OAuth callback processed successfully');
          console.log('User authenticated via OAuth');
          console.log('===============================');
          
          // Guardar token de autenticación
          localStorage.setItem("bitwave_auth_token", "oauth_auth_token_" + Date.now());
          
          // Redirigir al home
          navigate("/home");
        } else {
          console.error('Aegis account not available for callback');
          navigate("/auth");
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        // Redirigir a auth en caso de error
        navigate("/auth");
      }
    };

    handleOAuthCallback();
  }, [navigate, aegisAccount]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Procesando autenticación...
        </h1>
        <p className="text-muted-foreground">
          Por favor espera mientras completamos tu autenticación.
        </p>
        <div className="mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bitwave-orange mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;