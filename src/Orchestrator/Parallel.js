class ParallelExecutor {
  static async run(agents, context) {
    // Run all agents in parallel
    const results = await Promise.all(
      agents.map(agent => agent.run(context))
    );

    // Persist outputs after all complete
    await Promise.all(
      agents.map((agent, index) =>
        context.set(agent.id, results[index])
      )
    );
  }
}

module.exports = ParallelExecutor;
