import { KuusiConfig } from "@kuusi/kuusi/types";

const config = new KuusiConfig({
  // Configure kuusi here
  dotenv: {
    requiredKeys: ["GITHUB_TOKEN"],
  },
});

export default config;
