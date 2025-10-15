import { createDojoConfig } from "@dojoengine/core";

import { manifest } from "../config/manifest";
import { nodeUrl, toriiUrl } from "../config/cavosConfig";

export const dojoConfig = createDojoConfig({
    manifest,
    rpcUrl: nodeUrl,
    toriiUrl: toriiUrl,
});