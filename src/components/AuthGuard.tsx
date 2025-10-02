import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is authenticated
    // For now, we'll use localStorage to simulate authentication state
    const authToken = localStorage.getItem("bitwave_auth_token");
    const isAuth = !!authToken;

    setIsAuthenticated(isAuth);

    // If not authenticated and not on auth page, redirect to login
    if (!isAuth && !location.pathname.startsWith("/auth")) {
      navigate("/auth");
    }
  }, [navigate, location.pathname]);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // If not authenticated, redirect to auth page (don't render Auth component here)
  if (!isAuthenticated) {
    return null; // Let the router handle the redirect
  }

  // If authenticated, show the protected content
  return <>{children}</>;
};

export default AuthGuard;
