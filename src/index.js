const path = require("path");
const fs = require("fs");
require("dotenv").config();

const { parseYAML } = require("./parser/yamlParser");
const { validateConfig } = require("./parser/validator");
const Orchestrator = require("./Orchestrator/Orchestrator");
const ContextStore = require("./context/ContextStore");

/**
 * Intelligently select configuration file
 * Priority:
 * 1. Command-line argument (npm start config.yaml)
 * 2. File content detection (subAgentMode.yaml preferred if has content)
 * 3. Fallback to legacyMode.yaml if only one has content
 * 4. Error if both empty
 */
function selectConfigFile() {
  // Check if a specific config is provided via command line
  const args = process.argv.slice(2);
  if (args.length > 0) {
    const specificConfig = path.join(__dirname, "../config", args[0]);
    if (fs.existsSync(specificConfig)) {
      console.log(`📋 Using specified config: ${args[0]}`);
      return specificConfig;
    } else {
      console.error(`❌ Config file not found: ${args[0]}`);
      process.exit(1);
    }
  }

  // Auto-detect based on file content
  const legacyPath = path.join(__dirname, "../config/legacyMode.yaml");
  const subAgentPath = path.join(__dirname, "../config/subAgentMode.yaml");

  try {
    const legacyContent = fs.readFileSync(legacyPath, "utf-8").trim();
    const subAgentContent = fs.readFileSync(subAgentPath, "utf-8").trim();

    if (legacyContent && !subAgentContent) {
      console.log("📋 Using LEGACY MODE (subAgentMode.yaml is empty)");
      return legacyPath;
    } else if (subAgentContent && !legacyContent) {
      console.log("🤖 Using SUB-AGENT MODE (legacyMode.yaml is empty)");
      return subAgentPath;
    } else if (subAgentContent && legacyContent) {
      console.log("🤖 Both modes available, using SUB-AGENT MODE (more advanced)");
      return subAgentPath;
    } else {
      console.log("❌ Both config files are empty!");
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ Error reading config files:", err.message);
    process.exit(1);
  }
}

async function main() {
  try {
    const CONFIG_PATH = selectConfigFile();
    const config = parseYAML(CONFIG_PATH);
    validateConfig(config);

    const contextStore = new ContextStore();

    console.log("🚀 Starting Multi-Agent Orchestrator...\n");

    const orchestrator = new Orchestrator(config, contextStore);

    await orchestrator.run();

    await contextStore.flush();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

main();
