# Tools System - Quick Reference

## Tools at a Glance

| Tool | Purpose | Pattern | Example |
|------|---------|---------|---------|
| **calculator** | Math expressions | `[TOOL: calculator \| {"expression": "2+2"}]` | `"2+2 = 4"` |
| **webfetch** | HTTP/HTTPS requests | `[TOOL: webfetch \| {"url": "https://..."}]` | HTML/JSON content |
| **fileread** | Read local files | `[TOOL: fileread \| {"path": "data.csv"}]` | File contents |
| **python** | Execute Python code | `[TOOL: python \| {"code": "print(1+1)"}]` | stdout output |
| **bash** | Execute shell commands | `[TOOL: bash \| {"command": "ls -la"}]` | Command output |

## YAML Configuration Quick Start

### Basic Agent with Tools
```yaml
agents:
  - id: myagent
    role: My Role
    goal: My Goal
    tools: [python, fileread]  # Add tools here
```

### Sub-agent Hierarchy with Tools
```yaml
agents:
  - id: parent
    tools: [python]
    sub_agents: [child1, child2]

  - id: child1
    tools: [fileread, webfetch]

  - id: child2
    tools: [calculator]
```

## Tool Invocation Pattern

LLM outputs tool invocations in this pattern:
```
[TOOL: toolname | {"arg1": "value1", "arg2": "value2"}]
```

Agent automatically:
1. Detects the pattern
2. Parses tool name and arguments
3. Executes the tool
4. Replaces invocation with `[TOOL RESULT: ...]`

## Tool Security & Limits

| Tool | Timeout | Size Limit | Security |
|------|---------|-----------|----------|
| calculator | Instant | N/A | Safe characters only |
| webfetch | 10s | 5KB | HTTPS validation |
| fileread | Instant | 10KB | No path traversal |
| python | 30s | 10MB buffer | Isolated process |
| bash | 30s | 10MB buffer | Dangerous commands blocked |

## Common Use Cases

### Case 1: Data Analysis Workflow
```yaml
agents:
  - id: researcher
    tools: [fileread, python]
    # Can: read CSV → analyze with pandas → return insights
```

### Case 2: Web Research
```yaml
agents:
  - id: researcher
    tools: [webfetch, calculator]
    # Can: fetch data → perform calculations → summarize results
```

### Case 3: Complex Calculations
```yaml
agents:
  - id: analyst
    tools: [python, calculator]
    # Can: complex math, statistics, data processing
```

### Case 4: System Automation
```yaml
agents:
  - id: automation
    tools: [bash, python]
    # Can: run shell commands, execute automation scripts
```

## Logging Tool Execution

Tools are logged with timestamps and durations:
```
🤖 TOOL_INVOCATION: Tool invocation detected: python
💾 Tool execution completed in 2134ms
✅ Tool returned successful result
```

Check logs in `logs/execution-*.log` for full trace.

## Error Handling

Tool errors are included in agent output as:
```
[TOOL ERROR: Error message here]
```

Agent's LLM output should respond to errors gracefully.

## Integration in Agents

1. **Declare tools in YAML**: `tools: [python, fileread]`
2. **AgentFactory passes tools**: Extracts from config
3. **Agent stores tools**: `this.tools = tools`
4. **LLM receives description**: Via `getToolsDescription()`
5. **LLM invokes tools**: Outputs `[TOOL: name | {...}]` patterns
6. **Agent executes**: Via `processTooInvocations()`
7. **Results integrated**: Becomes part of agent output

## Testing Tools

### Test Calculator
```javascript
[TOOL: calculator | {"expression": "10 * (5 + 3)"}]
// Expected: "10 * (5 + 3) = 80"
```

### Test WebFetch
```javascript
[TOOL: webfetch | {"url": "https://jsonplaceholder.typicode.com/posts/1"}]
// Expected: JSON post data
```

### Test FileRead
```javascript
[TOOL: fileread | {"path": "package.json"}]
// Expected: package.json contents
```

### Test Python
```javascript
[TOOL: python | {"code": "import json; print(json.dumps({'status': 'ok'}))"}]
// Expected: {"status": "ok"}
```

### Test Bash
```javascript
[TOOL: bash | {"command": "echo 'Hello World'"}]
// Expected: Hello World
```

## Advanced: Adding Custom Tools

Edit `src/tools/ToolManager.js`:

```javascript
// Add method
async myTool(args) {
  // Validate args
  // Execute logic
  return "result as string";
}

// Register in execute()
case "mytool":
  return await this.myTool(args);

// Add description
myTool: "Description of my tool"
```

Use in YAML: `tools: [mytool]`

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Tool not running | Check YAML spelling; verify LLM outputs pattern |
| Timeout error | Simplify code; break into smaller tool calls |
| File not found | Use relative paths; ensure file exists |
| Web fetch fails | Verify URL; check 5KB size limit |
| Python error | Check syntax; view logs for stderr |
| Bash denied | Tool uses dangerous command; modify command |

## Performance Tips

1. **Parallel execution**: Run independent tools in sequence, let workflows parallelize
2. **Tool selection**: Choose fewest tools needed for role
3. **Caching**: Complex calculations → pre-compute or cache results
4. **Monitoring**: Check logs for slow operations (>5s)
5. **Composition**: Let multiple agents use complementary tools
