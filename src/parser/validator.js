function validateConfig(config) {
  if (!Array.isArray(config.agents)) {
    throw new Error("agents should be input as an array");
  }
  if (!config.workflow || !config.workflow.type) {
    throw new Error("workflow.type is required");
  }
  if (!["sequential", "parallel"].includes(config.workflow.type)) {
    throw new Error("Invalid workflow.type");
  }
}

module.exports = {validateConfig};
