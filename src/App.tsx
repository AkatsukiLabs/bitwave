import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AegisProvider } from "@cavos/aegis";
import { AEGIS_CONFIG } from "./config/aegis";
import Layout from "./components/Layout";
import AuthGuard from "./components/AuthGuard";
import Home from "./pages/Home";
import Store from "./pages/Store";
import Profile from "./pages/Profile";
import HowItWorks from "./pages/HowItWorks";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import DuckHunt from "./pages/DuckHunt";
import Snake from "./pages/Snake";
import Asteroids from "./pages/Asteroids";
import StrkJump from "./pages/StrkJump";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <AegisProvider
    config={{
      // Starknet network to connect to (testnet for development)
      network: AEGIS_CONFIG.network,

      // Application name displayed in wallet connections
      appName: AEGIS_CONFIG.appName,

      // Required: Your App ID from https://aegis.cavos.xyz
      appId: AEGIS_CONFIG.appId,

      // Enable debug logging for development
      enableLogging: AEGIS_CONFIG.enableLogging,

      // Optional: AVNU Paymaster API key for gasless transactions
      paymasterApiKey: AEGIS_CONFIG.paymasterApiKey,

      // Optional: Custom tracking URL for analytics
      trackingApiUrl: AEGIS_CONFIG.trackingApiUrl,
    }}
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          {/* Public routes without authentication */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/duck-hunt" element={<DuckHunt />} />
          <Route path="/snake" element={<Snake />} />
          <Route path="/asteroids" element={<Asteroids />} />
          <Route path="/strkjump" element={<StrkJump />} />

          {/* Root route - redirect to auth if not authenticated */}
          <Route
            path="/"
            element={
              localStorage.getItem("bitwave_auth_token") ? (
                <Navigate to="/home" replace />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          {/* Protected routes with authentication */}
          <Route
            path="/*"
            element={
              <AuthGuard>
                <Layout>
                  <Routes>
                    <Route path="/home" element={<Home />} />
                    <Route path="/store" element={<Store />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/how-it-works" element={<HowItWorks />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </AuthGuard>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </AegisProvider>
);

export default App;
