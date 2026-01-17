/**
 * Agent - Individual AI agent with optional tool support
 * Tools allow agents to invoke: calculator, web fetch, file read, python, bash
 */
const ToolManager = require("../tools/ToolManager");

class Agent {
  constructor({ id, role, goal, llm, instruction, subAgents = [], tools = [] }) {
    this.id = id;
    this.role = role;
    this.goal = goal;
    this.llm = llm;
    this.instruction = instruction;
    this.subAgents = subAgents; // Array of sub-agent objects
    this.tools = tools; // Array of available tool names
    this.toolManager = this.tools.length > 0 ? new ToolManager() : null;
  }

  /**
   * Get available tools description for LLM context
   * @returns {string} Tools description
   */
  getToolsDescription() {
    if (!this.tools || this.tools.length === 0) {
      return "No tools available.";
    }

    const toolManager = new ToolManager();
    const descriptions = toolManager.getToolDescriptions();
    let toolsText = "Available tools:\n";

    for (const tool of this.tools) {
      const desc = descriptions[tool.toLowerCase()];
      if (desc) {
        toolsText += `- ${tool}: ${desc}\n`;
      }
    }

    return toolsText;
  }

  async run(context, logger = null) {
    const startTime = Date.now();
    
    if (logger) {
      logger.agentStart(this.id, this.role);
    }

    try {
      // Prepare context with all previous outputs
      const contextStartTime = Date.now();
      const fullContext = await context.getAll();
      const contextDuration = Date.now() - contextStartTime;
      
      if (logger) {
        logger.dbOperation("retrieve", `${this.id}_context`, contextDuration);
      }

      // Generate response using LLM with tool descriptions
      const llmStartTime = Date.now();
      const toolsDescription = this.getToolsDescription();
      
      const llmParams = {
        agentId: this.id,
        role: this.role,
        goal: this.goal,
        context: fullContext,
        instruction: this.instruction,
        tools: toolsDescription
      };

      const output = await this.llm.generate(llmParams);
      const llmDuration = Date.now() - llmStartTime;
      
      if (logger) {
        logger.llmCall(this.llm.model || "unknown", llmDuration);
      }

      // Check if LLM output contains tool invocations
      let finalOutput = output;
      if (this.toolManager && this.tools.length > 0) {
        finalOutput = await this.processTooInvocations(output, context, logger);
      }

      // Store output in context
      const storeStartTime = Date.now();
      await context.set(this.id, finalOutput);
      const storeDuration = Date.now() - storeStartTime;
      
      if (logger) {
        logger.dbOperation("store", this.id, storeDuration);
      }

      // If this agent has sub-agents, delegate tasks to them
      if (this.subAgents && this.subAgents.length > 0) {
        if (logger) {
          logger.info(`Delegating to ${this.subAgents.length} sub-agents`, "SUB_AGENT_DELEGATION");
        }
        
        for (const subAgent of this.subAgents) {
          await subAgent.run(context, logger);
        }
      }

      const totalDuration = Date.now() - startTime;
      if (logger) {
        logger.agentEnd(this.id, totalDuration, true);
      }

      return finalOutput;
    } catch (err) {
      const totalDuration = Date.now() - startTime;
      if (logger) {
        logger.error(`Agent '${this.id}' failed: ${err.message}`, err, "AGENT_ERROR");
        logger.agentEnd(this.id, totalDuration, false);
      }
      throw err;
    }
  }

  /**
   * Process tool invocations in LLM output
   * Looks for patterns like [TOOL: calculator | {"expression": "2+2"}]
   * @param {string} output - LLM output
   * @param {Object} context - Context store
   * @param {Object} logger - Logger instance
   * @returns {Promise<string>} Modified output with tool results
   */
  async processTooInvocations(output, context, logger = null) {
    let modifiedOutput = output;
    
    // Pattern: [TOOL: toolname | {"arg": "value"}]
    const toolPattern = /\[TOOL:\s*(\w+)\s*\|\s*({[^}]+})\]/g;
    let match;

    while ((match = toolPattern.exec(output)) !== null) {
      const toolName = match[1];
      const argsStr = match[2];
      const fullMatch = match[0];

      if (logger) {
        logger.info(`Tool invocation detected: ${toolName}`, "TOOL_INVOCATION");
      }

      try {
        const args = JSON.parse(argsStr);
        const result = await this.toolManager.execute(toolName, args, logger);
        
        // Replace tool invocation with result
        modifiedOutput = modifiedOutput.replace(fullMatch, `[TOOL RESULT: ${result}]`);
      } catch (err) {
        if (logger) {
          logger.error(`Failed to execute tool ${toolName}: ${err.message}`, err, "TOOL_ERROR");
        }
        
        // Replace with error message
        modifiedOutput = modifiedOutput.replace(fullMatch, `[TOOL ERROR: ${err.message}]`);
      }
    }

    return modifiedOutput;
  }
}

module.exports = Agent;
