const SequentialExecutor = require("./Sequential");
const ParallelExecutor = require("./Parallel");
const AgentFactory = require("../agents/Agentfactory");

class Orchestrator {
  constructor(config, contextStore) {
    this.config = config;
    this.context = contextStore;
    this.agents = this.createAgents();
  }

  createAgents() {
    const agentMap = {};
    for (const agentConfig of this.config.agents) {
      agentMap[agentConfig.id] = AgentFactory.create(agentConfig);
    }
    return agentMap;
  }

  async run() {
    const { workflow } = this.config;

    if (workflow.type === "sequential") {
      const agents = workflow.steps.map(step => this.agents[step.agent]);
      await SequentialExecutor.run(agents, this.context);
    }

    if (workflow.type === "parallel") {
      const branchAgents = workflow.branches.map(id => this.agents[id]);
      await ParallelExecutor.run(branchAgents, this.context);

      if (workflow.then) {
        const finalAgent = this.agents[workflow.then.agent];
        await SequentialExecutor.run([finalAgent], this.context);
      }
    }

    await this.printResult();
  }

  async printResult() {
    console.log("\n===== FINAL OUTPUT =====");
    const allContext = await this.context.getAll();

    for (const [id, output] of Object.entries(allContext)) {
      console.log(`\n--- ${id} ---\n${output}`);
    }
  }
}

module.exports = Orchestrator;
