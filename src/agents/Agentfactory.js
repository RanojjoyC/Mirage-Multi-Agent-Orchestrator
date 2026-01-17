const Agent = require("./Agent");
const GroqLLM = require("../LLM/GroqLLM");

class AgentFactory {
  static create(agentConfig) {
    return new Agent({
      ...agentConfig,
      llm: new GroqLLM()
    });
  }
}
module.exports = AgentFactory;