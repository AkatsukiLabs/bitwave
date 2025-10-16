import { Button } from "@/components/ui/button";
import { LogOut, Copy, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAegisAuth } from "@/hooks/useAegisAuth";
import { toast } from "sonner";
import userIcon from "@/assets/user-icon.png";
import vesuIcon from "@/assets/vesu.png";

const Profile = () => {
  const navigate = useNavigate();
  const { isWalletConnected, logout, aegisAccount } = useAegisAuth();

  // Obtener información de la wallet desde el SDK
  const walletAddress = aegisAccount?.address || "Not connected";
  const walletBalance = "0.0"; // Placeholder - en una implementación real cargarías el balance aquí

  // Log de información de la wallet
  console.log('=== PROFILE WALLET INFO ===');
  console.log('Is wallet connected:', isWalletConnected);
  console.log('Wallet address:', walletAddress);
  console.log('Aegis account:', aegisAccount);
  console.log('===========================');

  const handleLogout = async () => {
    try {
      await logout();
      // Clear authentication token
      localStorage.removeItem("bitwave_auth_token");
      // Redirect to login
      navigate("/auth");
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: clear token and redirect
      localStorage.removeItem("bitwave_auth_token");
      navigate("/auth");
    }
  };

  const handleCopyAddress = () => {
    if (walletAddress && walletAddress !== "Not connected" && walletAddress !== "Not available") {
      navigator.clipboard.writeText(walletAddress);
      toast.success("Address copied to clipboard!");
    }
  };

  const handleViewOnExplorer = () => {
    if (walletAddress && walletAddress !== "Not connected" && walletAddress !== "Not available") {
      const explorerUrl = `https://sepolia.starkscan.co/contract/${walletAddress}`;
      window.open(explorerUrl, '_blank');
    }
  };
  return (
    <div className="max-w-md mx-auto">
      {/* Profile Header with Logout */}
      <div className="flex items-center justify-between mb-6">
        <div></div>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <img src={userIcon} alt="Profile" className="w-16 h-16" />
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-bitwave-orange"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      {/* Wallet Info */}
      <div className="text-center mb-8">
        <p className="text-muted-foreground mb-2">Your Wallet</p>
        <div className="bg-muted rounded-lg p-4 mb-3">
          <p className="text-sm font-mono text-foreground break-all">
            {walletAddress === "Not connected" || walletAddress === "Not available" 
              ? walletAddress 
              : `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
            }
          </p>
          {walletAddress !== "Not connected" && walletAddress !== "Not available" && (
            <div className="flex justify-center gap-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAddress}
                className="text-muted-foreground hover:text-bitwave-orange"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewOnExplorer}
                className="text-muted-foreground hover:text-bitwave-orange"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Balance: {walletBalance} BTC
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-8">
        <Button
          variant="secondary"
          className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold"
        >
          DEPOSIT +
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-bitwave-orange text-bitwave-orange hover:bg-bitwave-orange hover:text-background"
        >
          WITHDRAW -
        </Button>
      </div>

      {/* Rewards Section */}
      <div className="game-card rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-muted-foreground text-sm mb-3">Rewards</p>
            <img src={vesuIcon} alt="VESU" />
          </div>
          <Button className="bg-white hover:bg-gray-50 text-black font-bold px-8 mt-2">
            CLAIM
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
