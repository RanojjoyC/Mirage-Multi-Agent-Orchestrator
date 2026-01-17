const Anthropic = require("@anthropic-ai/sdk");
const LLMClient = require("./LLMClient");

class ClaudeLLM extends LLMClient {
  constructor(options = {}) {
    super();
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    this.model = options.model || "claude-3-5-sonnet-20241022";
    this.maxTokens = options.maxTokens || 1024;
  }

  async generate({ agentId, role, goal, context, instruction }) {
    const systemPrompt = instruction || `You are an AI agent.
Agent ID: ${agentId}
Role: ${role}
Goal: ${goal}`;

    const userMessage = `
Context Information:
${Object.entries(context || {})
  .map(([k, v]) => `${k}: ${v}`)
  .join("\n") || "None"}

Please provide a response based on your role and goal.`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        system: systemPrompt,
        messages: [
          { role: "user", content: userMessage }
        ]
      });

      return response.content[0].type === "text" ? response.content[0].text : "";
    } catch (err) {
      console.error("❌ Claude API Error:", err.message);
      throw err;
    }
  }
}

module.exports = ClaudeLLM;
