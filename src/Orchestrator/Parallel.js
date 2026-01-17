class ParallelExecutor {
  static async run(agents, context, logger = null) {
    if (logger) {
      logger.info(`Parallel execution: ${agents.length} agents running simultaneously`, "PARALLEL_EXECUTOR");
    }

    try {
      // Run all agents in parallel with logger
      const results = await Promise.all(
        agents.map(agent => agent.run(context, logger))
      );

      // Persist outputs after all complete
      await Promise.all(
        agents.map((agent, index) =>
          context.set(agent.id, results[index])
        )
      );

      if (logger) {
        logger.success(`Parallel execution completed: ${agents.length} agents`, "PARALLEL_EXECUTOR");
      }
    } catch (err) {
      if (logger) {
        logger.error(`Parallel execution failed: ${err.message}`, err, "PARALLEL_EXECUTOR");
      }
      throw err;
    }
  }
}

module.exports = ParallelExecutor;
