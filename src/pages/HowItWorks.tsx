import coinIcon from "@/assets/coin-icon.png";

const steps = [
  {
    id: 1,
    title: "Insert a coin",
    icon: "🪙",
    description: "Buy coins to play retro mini-games"
  },
  {
    id: 2,
    title: "Enjoy",
    icon: "😊",
    description: "Play your favorite retro games"
  },
  {
    id: 3,
    title: "Get reward",
    icon: "💰",
    description: "Earn rewards while playing"
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
          <div key={step.id} className="flex items-center gap-4">
            <div className="text-3xl">{step.icon}</div>
            <div>
              <h3 className="text-foreground font-bold text-lg mb-1">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {step.description}
              </p>
            </div>
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