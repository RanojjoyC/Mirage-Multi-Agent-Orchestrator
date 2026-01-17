class Agent {
  constructor({ id, role, goal, llm }) {
    this.id = id;
    this.role = role;
    this.goal = goal;
    this.llm = llm;
  }
  async run(context) {
    return this.llm.generate({
      agentId: this.id,
      role: this.role,
      goal: this.goal,
      context
    });
  }
}
module.exports = Agent;
