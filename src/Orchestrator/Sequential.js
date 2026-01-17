class SequentialExecutor {
  static async run(agents, contextStore) {
    for (const agent of agents) {
      const output = await agent.run(contextStore.getAll());
      contextStore.set(agent.id, output);
    }
  }
}

module.exports = SequentialExecutor;