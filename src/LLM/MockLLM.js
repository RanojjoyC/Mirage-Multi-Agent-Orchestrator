// Will try to implement a mockllm for first run
// maybe use as fallback if API key fails???
const LLMClient = require("./LLMClient");

class MockLLM extends LLMClient {
  async generate({agentId, role, goal, context}) {
    const ctx=Object.entries(context || {})
      .map(([k, v]) => `- ${k}: ${v.slice(0, 50)}...`)
      .join("\n");

    return `
[Agent: ${agentId}]
Role: ${role}
Goal: ${goal}

Received Context:
${ctx || "None"}

Output generated successfully.
`.trim();
  }
}

module.exports=MockLLM;

// Not final