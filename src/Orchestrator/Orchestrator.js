const SequentialExecutor = require("./Sequential");
const ParallelExecutor = require("./Parallel");
const AgentFactory = require("../agents/Agentfactory");
const { ExecutionLogger } = require("../utils/logger");

class Orchestrator {
  constructor(config, contextStore) {
    this.config = config;
    this.context = contextStore;
    this.logger = new ExecutionLogger(true); // Enable file logging
    this.agents = this.createAgents();
  }

  createAgents() {
    const agentMap = {};
    
    this.logger.info(`Creating ${this.config.agents.length} agents from configuration`, "ORCHESTRATOR");
    
    // First pass: create all agents
    for (const agentConfig of this.config.agents) {
      agentMap[agentConfig.id] = AgentFactory.create(agentConfig, agentMap);
      this.logger.success(`Created agent '${agentConfig.id}' (${agentConfig.role})`, "AGENT_CREATION");
    }
    
    // Second pass: link sub-agents (after all agents are created)
    for (const agentConfig of this.config.agents) {
      if (agentConfig.sub_agents && agentConfig.sub_agents.length > 0) {
        const agent = agentMap[agentConfig.id];
        agent.subAgents = agentConfig.sub_agents
          .map(subAgentId => agentMap[subAgentId])
          .filter(agent => agent !== undefined);
        this.logger.info(`Linked ${agent.subAgents.length} sub-agents to '${agentConfig.id}'`, "SUB_AGENT_LINKING");
      }
    }
    
    return agentMap;
  }

  async run() {
    const { workflow } = this.config;
    const workflowStartTime = Date.now();

    this.logger.workflowStart(workflow.type, Object.keys(this.agents).length);

    try {
      if (workflow.type === "sequential") {
        const agents = workflow.steps.map(step => this.agents[step.agent]);
        this.logger.info(`Starting SEQUENTIAL execution with ${agents.length} agents`, "WORKFLOW");
        await SequentialExecutor.run(agents, this.context, this.logger);
      }

      if (workflow.type === "parallel") {
        const branchAgents = workflow.branches.map(id => this.agents[id]);
        this.logger.info(`Starting PARALLEL execution with ${branchAgents.length} agents`, "WORKFLOW");
        await ParallelExecutor.run(branchAgents, this.context, this.logger);

        if (workflow.then) {
          const finalAgent = this.agents[workflow.then.agent];
          this.logger.info(`Running finalizer agent: '${workflow.then.agent}'`, "WORKFLOW");
          await SequentialExecutor.run([finalAgent], this.context, this.logger);
        }
      }

      const totalDuration = Date.now() - workflowStartTime;
      this.logger.workflowEnd(totalDuration, true);
    } catch (err) {
      const totalDuration = Date.now() - workflowStartTime;
      this.logger.error(`Workflow execution failed: ${err.message}`, err, "WORKFLOW");
      this.logger.workflowEnd(totalDuration, false);
      throw err;
    }

    await this.printResult();
  }

  async printResult() {
    console.log("\n===== FINAL OUTPUT =====");
    const allContext = await this.context.getAll();

    for (const [id, output] of Object.entries(allContext)) {
      console.log(`\n--- ${id} ---\n${output}`);
    }

    // Print execution summary
    this.logger.writeSummary();
  }
}

module.exports = Orchestrator;
