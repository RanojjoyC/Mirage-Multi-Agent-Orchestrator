const path = require("path");
require("dotenv").config();


const { parseYAML } = require("./parser/yamlParser");
const { validateConfig } = require("./parser/validator");
const Orchestrator = require("./Orchestrator/Orchestrator");
const ContextStore = require("./context/ContextStore");

const CONFIG_PATH = path.join(__dirname, "../config/sample.yaml");

async function main() {
  try {
    const config = parseYAML(CONFIG_PATH);
    validateConfig(config);

    const contextStore = new ContextStore();

    const orchestrator = new Orchestrator(config, contextStore);

    await orchestrator.run();

    await contextStore.flush();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

main();