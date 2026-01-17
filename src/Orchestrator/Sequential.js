class SequentialExecutor {
  static async run(agents, context, logger = null) {
    if (logger) {
      logger.info(`Sequential execution: ${agents.length} agents`, "SEQUENTIAL_EXECUTOR");
    }

    for (const agent of agents) {
      try {
        // Run agent with current context and logger
        const output = await agent.run(context, logger);

        // Persist agent output
        await context.set(agent.id, output);
      } catch (err) {
        if (logger) {
          logger.error(`Sequential execution halted at agent '${agent.id}'`, err, "SEQUENTIAL_EXECUTOR");
        }
        throw err;
      }
    }

    if (logger) {
      logger.success(`Sequential execution completed: ${agents.length} agents`, "SEQUENTIAL_EXECUTOR");
    }
  }
}

module.exports = SequentialExecutor;
