class SequentialExecutor {
  static async run(agents, context) {
    for (const agent of agents) {
      // Run agent with current context
      const output = await agent.run(context);

      // Persist agent output
      await context.set(agent.id, output);
    }
  }
}

module.exports = SequentialExecutor;
