const Agent = require("./Agent");
const GroqLLM = require("../LLM/GroqLLM");

class AgentFactory {
  static create(agentConfig, allAgents = {}) {
    // Use Groq LLM for all agents
    const llm = new GroqLLM();

    // Handle sub-agents if they exist
    let subAgents = [];
    if (agentConfig.sub_agents && agentConfig.sub_agents.length > 0) {
      subAgents = agentConfig.sub_agents
        .map(subAgentId => allAgents[subAgentId])
        .filter(agent => agent !== undefined);
    }

    // Extract tools array from config (optional)
    const tools = agentConfig.tools || [];

    return new Agent({
      id: agentConfig.id,
      role: agentConfig.role || agentConfig.id,
      goal: agentConfig.goal || "",
      llm,
      instruction: agentConfig.instruction,
      subAgents,
      tools  // Pass tools array to Agent
    });
  }
}

module.exports = AgentFactory;

