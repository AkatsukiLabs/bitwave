import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useAegisAuth } from "@/hooks/useAegisAuth";
import { usePlayerInitialization } from "@/hooks/usePlayerInitialization";
import { toast } from "sonner";
import bitwaveLogo from "@/assets/bitwave-logo.png";

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  
  const {
    isLoading,
    error,
    isWalletConnected,
    sdkInitialized,
    loginWithEmail,
    signUpWithEmail,
    loginWithGoogle,
    loginWithApple,
    loadSavedWallet,
    clearError,
  } = useAegisAuth();

  const { initializePlayer, isInitializing } = usePlayerInitialization();

  // Cargar wallet guardada al montar el componente (solo una vez)
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if we already have an auth token (coming from callback)
        const existingToken = localStorage.getItem("bitwave_auth_token");
        if (existingToken) {
          console.log('✅ Auth token found, user already authenticated');
          navigate("/home");
          return;
        }

        const hasWallet = await loadSavedWallet();
        if (hasWallet && isWalletConnected) {
          // Si ya hay una wallet conectada, ir directamente al home
          localStorage.setItem("bitwave_auth_token", "wallet_connected_" + Date.now());
          navigate("/home");
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      }
    };

    // Solo ejecutar una vez al montar el componente
    initAuth();
  }, []); // Array vacío para ejecutar solo una vez

  const handleGoogleAuth = async () => {
    try {
      clearError();
      // loginWithGoogle will redirect to Google OAuth
      // The callback will be handled by AuthCallback component
      await loginWithGoogle();
    } catch (err) {
      console.error("Google auth failed:", err);
    }
  };

  const handleAppleAuth = async () => {
    try {
      clearError();
      // loginWithApple will redirect to Apple OAuth
      // The callback will be handled by AuthCallback component
      await loginWithApple();
    } catch (err) {
      console.error("Apple auth failed:", err);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      clearError();

      if (isLogin) {
        await loginWithEmail(email, password);

        // Save auth token
        localStorage.setItem(
          "bitwave_auth_token",
          `email_auth_token_login_${Date.now()}`
        );

        // Initialize player after login
        const success = await initializePlayer();
        if (success) {
          navigate("/home");
        }
      } else {
        // Registro
        await signUpWithEmail(email, password);
        localStorage.setItem(
          "bitwave_auth_token",
          `email_auth_token_signup_${Date.now()}`
        );

        // Mostrar mensaje de éxito para registro
        toast.success("¡Registro exitoso!", {
          description: "Tu cuenta ha sido creada. Ahora puedes iniciar sesión.",
          duration: 4000,
        });

        // Cambiar a modo login automáticamente
        setIsLogin(true);
        return; // No navegar inmediatamente, dejar que el usuario haga login
      }
    } catch (err) {
      console.error("Email auth failed:", err);
    }
  };


  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="flex-1 flex items-center justify-center mb-16">
        <img
          src={bitwaveLogo}
          alt="BITWAVE"
          className="w-[500px] h-[180px] object-contain"
        />
      </div>

      {/* Error Alert */}
      {error && (
        <div className="w-full max-w-xs mb-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* SDK Initialization Alert */}
      {!sdkInitialized && (
        <div className="w-full max-w-xs mb-4">
          <Alert>
            <AlertDescription>
              Inicializando SDK de Aegis... Si este mensaje persiste, verifica tu configuración.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Auth Form */}
      <div className="w-full max-w-xs space-y-6 mb-8">
        {/* Toggle between Login and Sign Up */}
        <div className="flex bg-muted rounded-lg p-1">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              isLogin
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              !isLogin
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Email and Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 bg-background border-border text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 bg-background border-border text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || isInitializing || !sdkInitialized}
            className="w-full h-12 bg-bitwave-orange hover:bg-bitwave-gold text-black font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading || isInitializing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isInitializing ? "Initializing..." : isLogin ? "Logging in..." : "Signing up..."}
              </>
            ) : (
              isLogin ? "Login" : "Sign Up"
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Auth Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleGoogleAuth}
            disabled={isLoading || !sdkInitialized}
            className="w-full h-12 bg-white hover:bg-gray-50 text-black font-medium rounded-lg border border-gray-200 transition-colors disabled:opacity-50"
          >
            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <Button
            onClick={handleAppleAuth}
            disabled={isLoading || !sdkInitialized}
            className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
              />
            </svg>
            Continue with Apple
          </Button>

        </div>
      </div>
    </div>
  );
};

export default Auth;
