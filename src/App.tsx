import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import AuthGuard from "./components/AuthGuard";
import Home from "./pages/Home";
import Store from "./pages/Store";
import Profile from "./pages/Profile";
import HowItWorks from "./pages/HowItWorks";
import Auth from "./pages/Auth";
import DuckHunt from "./pages/DuckHunt";
import Snake from "./pages/Snake";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes without authentication */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/duck-hunt" element={<DuckHunt />} />
          <Route path="/snake" element={<Snake />} />

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
);

export default App;
