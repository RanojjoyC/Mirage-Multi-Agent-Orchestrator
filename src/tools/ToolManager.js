/**
 * ToolManager - Manages available tools that agents can invoke
 * Supports: Calculator, Web Fetch, File Read, Python execution
 */

const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class ToolManager {
  constructor() {
    this.tools = {
      calculator: this.calculateTool,
      webfetch: this.webfetchTool,
      fileread: this.filereadTool,
      python: this.pythonTool,
      bash: this.bashTool
    };
  }

  /**
   * Execute a tool by name with arguments
   * @param {string} toolName - Name of the tool
   * @param {Object} args - Tool arguments
   * @param {Object} logger - Logger instance
   * @returns {Promise<string>} Tool result
   */
  async execute(toolName, args, logger = null) {
    const toolNameLower = toolName.toLowerCase();
    
    if (!this.tools[toolNameLower]) {
      throw new Error(`Unknown tool: ${toolName}. Available: ${Object.keys(this.tools).join(", ")}`);
    }

    if (logger) {
      logger.info(`Executing tool: ${toolName}`, "TOOL");
    }

    try {
      const result = await this.tools[toolNameLower].call(this, args, logger);
      if (logger) {
        logger.success(`Tool '${toolName}' completed`, "TOOL");
      }
      return result;
    } catch (err) {
      if (logger) {
        logger.error(`Tool '${toolName}' failed: ${err.message}`, err, "TOOL");
      }
      throw err;
    }
  }

  /**
   * Calculator tool - Performs mathematical calculations
   * @param {Object} args - { expression: "2 + 2 * 3" }
   */
  async calculateTool(args, logger = null) {
    if (!args || !args.expression) {
      throw new Error("Calculator requires 'expression' argument");
    }

    try {
      // Simple expression evaluator (be careful with eval in production)
      let expression = args.expression.trim();
      
      if (logger) {
        logger.info(`Calculator parsing: "${expression}"`, "TOOL_DEBUG");
      }

      // Validate expression contains only safe characters (numbers, spaces, operators)
      if (!/^[\d\s+\-*/()\.\*]*$/.test(expression)) {
        throw new Error(`Invalid characters in expression. Only numbers, spaces and operators +, -, *, /, (, ) allowed.`);
      }

      const result = Function(`"use strict"; return (${expression})`)();
      
      if (logger) {
        logger.info(`Calculator: ${expression} = ${result}`, "TOOL_RESULT");
      }

      return `${expression} = ${result}`;
    } catch (err) {
      throw new Error(`Calculation failed: ${err.message}`);
    }
  }

  /**
   * Web Fetch tool - Retrieves content from URLs
   * @param {Object} args - { url: "https://example.com" }
   */
  async webfetchTool(args, logger = null) {
    if (!args || !args.url) {
      throw new Error("WebFetch requires 'url' argument");
    }

    try {
      const url = args.url.trim();
      
      // Validate URL
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        throw new Error("URL must start with http:// or https://");
      }

      if (logger) {
        logger.info(`Fetching: ${url}`, "TOOL_DETAIL");
      }

      const response = await fetch(url, {
        timeout: 10000,
        headers: {
          "User-Agent": "Mirage-Multi-Agent-Orchestrator/1.0"
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const content = await response.text();
      
      // Limit content length
      const maxLength = 5000;
      const truncated = content.length > maxLength 
        ? content.slice(0, maxLength) + "\n... [truncated]" 
        : content;

      if (logger) {
        logger.info(`Fetched ${content.length} bytes from ${url}`, "TOOL_RESULT");
      }

      return truncated;
    } catch (err) {
      throw new Error(`Web fetch failed: ${err.message}`);
    }
  }

  /**
   * File Read tool - Reads local files
   * @param {Object} args - { path: "data.csv" }
   */
  async filereadTool(args, logger = null) {
    if (!args || !args.path) {
      throw new Error("FileRead requires 'path' argument");
    }

    try {
      let filePath = args.path.trim();

      // Security: prevent directory traversal attacks
      if (filePath.includes("..")) {
        throw new Error("Path traversal not allowed");
      }

      // If relative path, make it relative to project root
      if (!path.isAbsolute(filePath)) {
        filePath = path.join(process.cwd(), filePath);
      }

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Check if it's a file (not directory)
      const stats = fs.statSync(filePath);
      if (!stats.isFile()) {
        throw new Error(`Not a file: ${filePath}`);
      }

      if (logger) {
        logger.info(`Reading file: ${filePath}`, "TOOL_DETAIL");
      }

      const content = fs.readFileSync(filePath, "utf-8");

      // Limit content length
      const maxLength = 10000;
      const truncated = content.length > maxLength
        ? content.slice(0, maxLength) + "\n... [truncated]"
        : content;

      if (logger) {
        logger.info(`Read ${content.length} bytes from ${filePath}`, "TOOL_RESULT");
      }

      return truncated;
    } catch (err) {
      throw new Error(`File read failed: ${err.message}`);
    }
  }

  /**
   * Python tool - Executes Python code
   * @param {Object} args - { code: "print(2 + 2)" } or { file: "script.py" }
   */
  async pythonTool(args, logger = null) {
    if (!args || (!args.code && !args.file)) {
      throw new Error("Python tool requires 'code' or 'file' argument");
    }

    try {
      let pythonCode = args.code;

      // If file path provided, read it
      if (args.file && !args.code) {
        let filePath = args.file.trim();
        if (!path.isAbsolute(filePath)) {
          filePath = path.join(process.cwd(), filePath);
        }

        if (!fs.existsSync(filePath)) {
          throw new Error(`Python file not found: ${filePath}`);
        }

        if (logger) {
          logger.info(`Reading Python file: ${filePath}`, "TOOL_DETAIL");
        }

        pythonCode = fs.readFileSync(filePath, "utf-8");
      }

      if (logger) {
        logger.info(`Executing Python code (${pythonCode.length} chars)`, "TOOL_DETAIL");
      }

      // Execute Python code with timeout
      const command = `python -c "${pythonCode.replace(/"/g, '\\"')}"`;
      
      const output = execSync(command, {
        timeout: 30000, // 30 second timeout
        encoding: "utf-8",
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });

      if (logger) {
        logger.info(`Python execution completed, output: ${output.length} chars`, "TOOL_RESULT");
      }

      return output;
    } catch (err) {
      throw new Error(`Python execution failed: ${err.message}`);
    }
  }

  /**
   * Bash tool - Executes shell commands
   * @param {Object} args - { command: "ls -la" }
   */
  async bashTool(args, logger = null) {
    if (!args || !args.command) {
      throw new Error("Bash tool requires 'command' argument");
    }

    try {
      const command = args.command.trim();

      // Security: block dangerous commands
      const dangerous = ["rm", "rmdir", "dd", "mkfs", "shutdown", "reboot"];
      const isDangerous = dangerous.some(cmd => 
        command.toLowerCase().startsWith(cmd)
      );

      if (isDangerous) {
        throw new Error(`Dangerous command not allowed: ${command}`);
      }

      if (logger) {
        logger.info(`Executing bash command: ${command}`, "TOOL_DETAIL");
      }

      const output = execSync(command, {
        timeout: 30000,
        encoding: "utf-8",
        maxBuffer: 10 * 1024 * 1024
      });

      if (logger) {
        logger.info(`Bash command completed, output: ${output.length} chars`, "TOOL_RESULT");
      }

      return output;
    } catch (err) {
      throw new Error(`Bash execution failed: ${err.message}`);
    }
  }

  /**
   * Get list of available tools
   * @returns {Array} Tool names
   */
  getAvailableTools() {
    return Object.keys(this.tools);
  }

  /**
   * Get tool descriptions
   * @returns {Object} Tool descriptions
   */
  getToolDescriptions() {
    return {
      calculator: "Perform mathematical calculations. Args: { expression: '2 + 2 * 3' }",
      webfetch: "Fetch content from web URLs. Args: { url: 'https://example.com' }",
      fileread: "Read local files. Args: { path: 'data.csv' }",
      python: "Execute Python code. Args: { code: 'print(1+1)' } or { file: 'script.py' }",
      bash: "Execute shell commands. Args: { command: 'ls -la' }"
    };
  }
}

module.exports = ToolManager;
