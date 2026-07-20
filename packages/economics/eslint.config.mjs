import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Domain rule: no generic revenue fields anywhere. Money values are
      // layer-tagged LayeredMoney; see scripts/check-layer-tagging.mjs for the
      // repo-wide CI enforcement.
      "no-restricted-syntax": [
        "error",
        {
          selector: "Identifier[name=/^(revenue|revenueCents|totalRevenue|netRevenue|grossRevenue)$/]",
          message:
            "Generic 'revenue' fields are forbidden. Tag money with an EconomicLayer (CONSUMER_GMS, STORE_NET_SALES, FYUL_RECOGNIZED, FYUL_CONTRIBUTION, PIPELINE_EV).",
        },
      ],
    },
  }
);
