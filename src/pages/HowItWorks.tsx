import coinIcon from "@/assets/coin-icon.png";
import happyFace from "@/assets/happy-face.png";
import money from "@/assets/money.png";

const steps = [
  {
    id: 1,
    title: "Insert a coin",
    icon: coinIcon,
  },
  {
    id: 2,
    title: "Enjoy",
    icon: happyFace,
  },
  {
    id: 3,
    title: "Get reward",
    icon: money,
  },
];

const HowItWorks = () => {
  return (
    <div className="max-w-md mx-auto">
      {/* Title */}
      <h2 className="text-2xl font-bold text-foreground text-center mb-12">
        How it works?
      </h2>

      {/* Steps */}
      <div className="space-y-8 mb-12">
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center text-center gap-3">
            <img src={step.icon} alt={step.title} className="w-8 h-8" />
            <h3 className="text-foreground font-bold text-lg">
              {step.title}
            </h3>
          </div>
        ))}
      </div>

      {/* Information Box */}
      <div className="game-card rounded-lg p-6 text-center">
        <h3 className="text-foreground font-bold text-lg mb-4">
          Play. Earn. Repeat.
        </h3>
        <div className="space-y-3 text-foreground text-sm leading-relaxed">
          <p>
            Buy coins to play retro mini-games.
          </p>
          <p>
            While you play, your coins generate yield.
          </p>
          <p>
            When you're out of coins, buy more and keep earning!
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;