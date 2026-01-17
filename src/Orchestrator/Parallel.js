class ParallelExecutor {
  static async run(agents, contextStore) {
    const results = await Promise.all(
      agents.map(agent => agent.run(contextStore.getAll()))
    );
    agents.forEach((agent, i) => {
      contextStore.set(agent.id, results[i]);
    });
  }
}
module.exports = ParallelExecutor;