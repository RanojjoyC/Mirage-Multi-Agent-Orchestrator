const SequentialExecutor = require("./Sequential");
const ParallelExecutor = require("./Parallel");
const AgentFactory = require("../agents/Agentfactory");
const ContextStore = require("../context/ContextStore");

class Orchestrator {
  constructor(config) {
    this.config = config;
    this.context = new ContextStore();
    this.agents = this.createAgents();
  }

  createAgents() {
    const map = {};
    for (const agent of this.config.agents) {
      map[agent.id] = AgentFactory.create(agent);
    }
    return map;
  }

  async run() {
    const { workflow } = this.config;

    if (workflow.type === "sequential") {
      const agents = workflow.steps.map(s => this.agents[s.agent]);
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

    this.printResult();
  }

  printResult() {
    console.log("\n===== FINAL OUTPUT =====");
    for (const [id, output] of Object.entries(this.context.getAll())) {
      console.log(`\n--- ${id} ---\n${output}`);
    }
  }
}

module.exports = Orchestrator;