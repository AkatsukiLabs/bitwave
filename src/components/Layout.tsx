import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Coins, User } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-foreground text-lg font-mono">3</span>
          <div className="w-8 h-8 bg-bitwave-gold rounded-full coin-icon"></div>
          <span className="text-bitwave-orange text-xl font-bold">+</span>
        </div>
        <h1 className="bitwave-logo text-3xl font-black tracking-wider">
          BITWAVE
        </h1>
        <div className="w-16"></div> {/* Spacer for centering */}
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex items-center justify-around py-3">
          <Link 
            to="/" 
            className={`nav-icon p-3 rounded-lg transition-colors ${
              isActive('/') ? 'text-bitwave-orange' : 'text-muted-foreground'
            }`}
          >
            <Home size={24} />
          </Link>
          
          <Link 
            to="/store" 
            className={`nav-icon p-3 rounded-lg transition-colors ${
              isActive('/store') ? 'text-bitwave-orange' : 'text-muted-foreground'
            }`}
          >
            <Coins size={24} />
          </Link>
          
          <Link 
            to="/profile" 
            className={`nav-icon p-3 rounded-lg transition-colors ${
              isActive('/profile') ? 'text-bitwave-orange' : 'text-muted-foreground'
            }`}
          >
            <User size={24} />
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Layout;