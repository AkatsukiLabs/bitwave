import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./polyfills"; // Import polyfills first

// Dojo
import { init } from "@dojoengine/sdk";
import { DojoSdkProvider } from "@dojoengine/sdk/react";
import { dojoConfig } from "./dojo/dojoConfig";
import type { SchemaType } from "./dojo/models.gen";
import { setupWorld } from "./dojo/contracts.gen";

// Init Dojo
async function main() {
  const sdk = await init<SchemaType>({
    client: {
      toriiUrl: dojoConfig.toriiUrl,
      relayUrl: dojoConfig.relayUrl,
      worldAddress: dojoConfig.manifest.world.address,
    },
    domain: {
      name: "Bitwave Gaming Platform",
      version: "1.0",
      chainId: "KATANA",
      revision: "1",
    },
  });

  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error("Root element not found");

  createRoot(rootElement).render(
    <StrictMode>
      <DojoSdkProvider sdk={sdk} dojoConfig={dojoConfig} clientFn={setupWorld}>
        <App />
      </DojoSdkProvider>
    </StrictMode>
  );
}

main().catch((error) => {
  console.error("Failed to initialize the application:", error);
});
