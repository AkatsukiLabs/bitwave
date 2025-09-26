import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

const Profile = () => {
  return (
    <div className="max-w-md mx-auto">
      {/* Profile Icon */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-bitwave-orange rounded-full mx-auto mb-4 flex items-center justify-center">
          <User size={32} className="text-background" />
        </div>
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
          variant="bitwave"
          className="flex-1"
        >
          WITHDRAW -
        </Button>
      </div>

      {/* Rewards Section */}
      <div className="game-card rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm mb-1">Rewards</p>
            <p className="text-foreground font-bold text-lg">VESU</p>
          </div>
          <Button
            variant="secondary"
            className="bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold px-8"
          >
            CLAIM
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;