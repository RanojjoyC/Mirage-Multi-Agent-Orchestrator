const fs = require("fs");
const path = require("path");

/**
 * ExecutionLogger - Comprehensive logging system for multi-agent orchestration
 * 
 * Features:
 * - Console output with emoji indicators
 * - File-based execution logs (logs/ directory)
 * - Execution timeline tracking
 * - Error logging with stack traces
 * - Performance metrics
 */
class ExecutionLogger {
  constructor(enableFileLogging = true) {
    this.enableFileLogging = enableFileLogging;
    this.logsDir = path.join(process.cwd(), "logs");
    this.executionStartTime = Date.now();
    this.executionId = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5); // timestamp without milliseconds
    this.logFile = null;
    this.events = []; // Timeline of all events

    if (this.enableFileLogging) {
      this.initializeLogging();
    }
  }

  /**
   * Initialize logging directory and files
   * @private
   */
  initializeLogging() {
    try {
      if (!fs.existsSync(this.logsDir)) {
        fs.mkdirSync(this.logsDir, { recursive: true });
      }
      this.logFile = path.join(this.logsDir, `execution-${this.executionId}.log`);
      this.writeToFile(`\n${"=".repeat(80)}\nExecution Started: ${new Date().toISOString()}\nExecution ID: ${this.executionId}\n${"=".repeat(80)}\n`);
    } catch (err) {
      console.error("❌ Failed to initialize logging:", err.message);
    }
  }

  /**
   * Write message to log file
   * @private
   */
  writeToFile(message) {
    if (this.enableFileLogging && this.logFile) {
      try {
        fs.appendFileSync(this.logFile, message + "\n");
      } catch (err) {
        console.error("❌ Failed to write to log file:", err.message);
      }
    }
  }

  /**
   * Log info message with timestamp
   * @param {string} message - Message to log
   * @param {string} section - Section/category of the log
   */
  info(message, section = "INFO") {
    const timestamp = this.getTimestamp();
    const logMessage = `[${timestamp}] ℹ️  [${section}] ${message}`;
    console.log(logMessage);
    this.writeToFile(logMessage);
    this.events.push({ type: "info", time: Date.now(), message, section });
  }

  /**
   * Log success message
   * @param {string} message - Message to log
   * @param {string} section - Section/category of the log
   */
  success(message, section = "SUCCESS") {
    const timestamp = this.getTimestamp();
    const logMessage = `[${timestamp}] ✅ [${section}] ${message}`;
    console.log(logMessage);
    this.writeToFile(logMessage);
    this.events.push({ type: "success", time: Date.now(), message, section });
  }

  /**
   * Log error message with optional stack trace
   * @param {string} message - Error message
   * @param {Error} error - Error object (optional)
   * @param {string} section - Section/category of the log
   */
  error(message, error = null, section = "ERROR") {
    const timestamp = this.getTimestamp();
    const logMessage = `[${timestamp}] ❌ [${section}] ${message}`;
    console.error(logMessage);
    this.writeToFile(logMessage);
    
    if (error && error.stack) {
      const stackTrace = `Stack: ${error.stack}`;
      console.error(stackTrace);
      this.writeToFile(stackTrace);
    }
    
    this.events.push({ type: "error", time: Date.now(), message, section, error: error?.message });
  }

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {string} section - Section/category of the log
   */
  warn(message, section = "WARN") {
    const timestamp = this.getTimestamp();
    const logMessage = `[${timestamp}] ⚠️  [${section}] ${message}`;
    console.warn(logMessage);
    this.writeToFile(logMessage);
    this.events.push({ type: "warn", time: Date.now(), message, section });
  }

  /**
   * Log agent execution start
   * @param {string} agentId - Agent ID
   * @param {string} role - Agent role
   */
  agentStart(agentId, role) {
    const timestamp = this.getTimestamp();
    const logMessage = `[${timestamp}] 🤖 [AGENT START] Agent '${agentId}' (${role}) is executing...`;
    console.log(logMessage);
    this.writeToFile(logMessage);
    this.events.push({ type: "agent_start", time: Date.now(), agentId, role });
  }

  /**
   * Log agent execution completion
   * @param {string} agentId - Agent ID
   * @param {number} duration - Execution time in milliseconds
   * @param {boolean} success - Whether execution was successful
   */
  agentEnd(agentId, duration, success = true) {
    const timestamp = this.getTimestamp();
    const status = success ? "✅" : "❌";
    const logMessage = `[${timestamp}] ${status} [AGENT END] Agent '${agentId}' completed in ${duration}ms`;
    console.log(logMessage);
    this.writeToFile(logMessage);
    this.events.push({ type: "agent_end", time: Date.now(), agentId, duration, success });
  }

  /**
   * Log database operation
   * @param {string} operation - Operation type (set, get, query)
   * @param {string} key - Key/ID being operated on
   * @param {number} duration - Operation time in milliseconds
   */
  dbOperation(operation, key, duration) {
    const timestamp = this.getTimestamp();
    const logMessage = `[${timestamp}] 💾 [DB ${operation.toUpperCase()}] Key '${key}' in ${duration}ms`;
    console.log(logMessage);
    this.writeToFile(logMessage);
    this.events.push({ type: "db_operation", time: Date.now(), operation, key, duration });
  }

  /**
   * Log LLM API call
   * @param {string} model - LLM model name
   * @param {number} duration - API call duration
   * @param {number} tokens - Tokens used (optional)
   */
  llmCall(model, duration, tokens = null) {
    const timestamp = this.getTimestamp();
    const tokenInfo = tokens ? ` | ${tokens} tokens` : "";
    const logMessage = `[${timestamp}] 🧠 [LLM CALL] ${model} in ${duration}ms${tokenInfo}`;
    console.log(logMessage);
    this.writeToFile(logMessage);
    this.events.push({ type: "llm_call", time: Date.now(), model, duration, tokens });
  }

  /**
   * Log workflow execution
   * @param {string} workflowType - sequential or parallel
   * @param {number} agentCount - Number of agents
   */
  workflowStart(workflowType, agentCount) {
    const timestamp = this.getTimestamp();
    const logMessage = `[${timestamp}] 🚀 [WORKFLOW START] Type: ${workflowType}, Agents: ${agentCount}`;
    console.log(logMessage);
    this.writeToFile(logMessage);
    this.events.push({ type: "workflow_start", time: Date.now(), workflowType, agentCount });
  }

  /**
   * Log workflow completion
   * @param {number} totalDuration - Total execution time
   * @param {boolean} success - Whether workflow succeeded
   */
  workflowEnd(totalDuration, success = true) {
    const timestamp = this.getTimestamp();
    const status = success ? "✅" : "❌";
    const logMessage = `[${timestamp}] ${status} [WORKFLOW END] Completed in ${totalDuration}ms`;
    console.log(logMessage);
    this.writeToFile(logMessage);
    this.events.push({ type: "workflow_end", time: Date.now(), totalDuration, success });
  }

  /**
   * Get formatted timestamp
   * @returns {string} Formatted timestamp
   * @private
   */
  getTimestamp() {
    const now = new Date();
    return now.toISOString().split("T")[1].slice(0, 12); // HH:MM:SS.mmm
  }

  /**
   * Generate execution summary
   * @returns {Object} Summary of execution
   */
  getSummary() {
    const totalDuration = Date.now() - this.executionStartTime;
    const agentEvents = this.events.filter(e => e.type === "agent_start" || e.type === "agent_end");
    const dbEvents = this.events.filter(e => e.type === "db_operation");
    const llmEvents = this.events.filter(e => e.type === "llm_call");
    const errors = this.events.filter(e => e.type === "error");

    return {
      executionId: this.executionId,
      totalDuration,
      startTime: new Date(this.executionStartTime).toISOString(),
      endTime: new Date().toISOString(),
      totalEvents: this.events.length,
      agentsExecuted: agentEvents.filter(e => e.type === "agent_start").length,
      dbOperations: dbEvents.length,
      llmCalls: llmEvents.length,
      errors: errors.length,
      logFile: this.logFile
    };
  }

  /**
   * Write summary to file and console
   */
  writeSummary() {
    const summary = this.getSummary();
    const separator = "=".repeat(80);
    const summaryText = `
${separator}
EXECUTION SUMMARY
${separator}
Execution ID: ${summary.executionId}
Total Duration: ${summary.totalDuration}ms
Start Time: ${summary.startTime}
End Time: ${summary.endTime}
Total Events: ${summary.totalEvents}
Agents Executed: ${summary.agentsExecuted}
DB Operations: ${summary.dbOperations}
LLM Calls: ${summary.llmCalls}
Errors: ${summary.errors}
Log File: ${summary.logFile}
${separator}
`;
    console.log(summaryText);
    this.writeToFile(summaryText);
  }

  /**
   * Get execution timeline
   * @returns {Array} Array of events with timestamps
   */
  getTimeline() {
    return this.events.map(event => ({
      ...event,
      timestamp: new Date(event.time).toISOString()
    }));
  }
}

module.exports = { ExecutionLogger, log: (msg) => console.log(`[Mirage] ${msg}`) };
