const Groq = require("groq-sdk");
const LLMClient = require("./LLMClient");

class GroqLLM extends LLMClient {
  constructor() {
    super();
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }

  async generate({ agentId, role, goal, context, instruction, tools }) {
    const toolsSection = tools ? `\n\nAvailable Tools:\n${tools}` : "";
    const instructionSection = instruction ? `\n\nSpecial Instructions:\n${instruction}` : "";
    
    const prompt = `
You are an AI agent.

Agent ID: ${agentId}
Role: ${role}
Goal: ${goal}${instructionSection}${toolsSection}

Shared Context:
${Object.entries(context || {})
  .map(([k, v]) => `${k}: ${v}`)
  .join("\n") || "None"}

Produce your output clearly.
`;

    try {
      const completion = await this.client.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "user", content: prompt }
        ]
      });

      return completion.choices[0].message.content;
    } catch (err) {
      console.error("❌ Groq API Error:", err.message);
      console.error("Status:", err.status);
      throw err;
    }
  }
}

module.exports = GroqLLM;
