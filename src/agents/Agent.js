class Agent {
  constructor({ id, role, goal, llm, instruction, subAgents = [] }) {
    this.id = id;
    this.role = role;
    this.goal = goal;
    this.llm = llm;
    this.instruction = instruction;
    this.subAgents = subAgents; // Array of sub-agent objects
  }

  async run(context) {
    // Prepare context with all previous outputs
    const fullContext = await context.getAll();

    // Generate response using LLM
    const output = await this.llm.generate({
      agentId: this.id,
      role: this.role,
      goal: this.goal,
      context: fullContext,
      instruction: this.instruction
    });

    // Store output in context
    await context.set(this.id, output);

    // If this agent has sub-agents, delegate tasks to them
    if (this.subAgents && this.subAgents.length > 0) {
      for (const subAgent of this.subAgents) {
        await subAgent.run(context);
      }
    }

    return output;
  }
}

module.exports = Agent;
