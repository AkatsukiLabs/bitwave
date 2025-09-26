import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import userIcon from "@/assets/user-icon.png";
import vesuIcon from "@/assets/vesu.png";

const Profile = () => {
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
        <Link to="/auth">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-bitwave-orange"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Wallet Info */}
      <div className="text-center mb-8">
        <p className="text-muted-foreground mb-2">Your Wallet</p>
        <p className="text-xl font-mono text-foreground tracking-wider">
          0x058...864f
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
          <Button
            className="bg-white hover:bg-gray-50 text-black font-bold px-8 mt-2"
          >
            CLAIM
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;