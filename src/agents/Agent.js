class Agent {
  constructor({ id, role, goal, llm }) {
    this.id = id;
    this.role = role;
    this.goal = goal;
    this.llm = llm;
  }

  async run(context) {
    const output = await this.llm.generate({
      agentId: this.id,
      role: this.role,
      goal: this.goal,
      context: await context.getAll(),
    });

    await context.set(this.id, output);

    return output;
  }
}

module.exports = Agent;
