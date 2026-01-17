require("dotenv").config();
const { parseYAML } = require("./parser/yamlParser");
const { validateConfig } = require("./parser/validator");
const Orchestrator = require("./Orchestrator/Orchestrator");

const CONFIG_PATH = "config/sample.yaml";

try {
  const config = parseYAML(CONFIG_PATH);
  validateConfig(config);

  const orchestrator = new Orchestrator(config);
  orchestrator.run();
} catch (err) {
  console.error("❌ Error:", err.message);
}