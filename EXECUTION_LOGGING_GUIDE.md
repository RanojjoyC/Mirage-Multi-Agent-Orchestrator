# 📊 Execution Logging Guide

## What is Execution Logging?

**Execution Logging** is a comprehensive system that tracks every step of your multi-agent orchestrator's workflow. It records:

- ✅ When each agent starts and ends
- ✅ How long each operation takes (performance metrics)
- ✅ Database operations (storage, retrieval)
- ✅ LLM API calls and durations
- ✅ Workflow progress and status
- ✅ Errors with stack traces
- ✅ Complete execution timeline

## Why Use Execution Logging?

| Use Case | Benefit |
|----------|---------|
| **Debugging** | Find exactly where failures occur |
| **Performance Tuning** | Identify slow agents and operations |
| **Monitoring** | Track system health in production |
| **Auditing** | Maintain complete execution history |
| **Optimization** | Data-driven decisions about improvements |
| **Troubleshooting** | Understand what happened during execution |

---

## How It Works

### 1. **Console Output** (Real-time)
Every event is immediately printed to console with emoji indicators:

```
[12:34:56.789] 🚀 [WORKFLOW START] Type: sequential, Agents: 2
[12:34:56.890] 🤖 [AGENT START] Agent 'researcher' (Senior Researcher) is executing...
[12:34:58.234] 🧠 [LLM CALL] groq in 1344ms
[12:34:58.245] 💾 [DB STORE] Key 'researcher' in 11ms
[12:34:58.250] ✅ [AGENT END] Agent 'researcher' completed in 1360ms
[12:34:58.251] 🤖 [AGENT START] Agent 'writer' (Content Writer) is executing...
[12:34:59.600] 🧠 [LLM CALL] groq in 1349ms
[12:34:59.610] 💾 [DB STORE] Key 'writer' in 10ms
[12:34:59.615] ✅ [AGENT END] Agent 'writer' completed in 1364ms
[12:34:59.620] ✅ [WORKFLOW END] Completed in 2762ms
```

### 2. **File Logging** (Persistent)
All events are also saved to `logs/` directory:

```
logs/
├── execution-2024-01-18T15-30-45.log
├── execution-2024-01-18T15-35-20.log
└── execution-2024-01-18T15-40-15.log
```

Each log file contains:
- Timestamped events
- Performance metrics
- Error details
- Execution summary

---

## Log Output Examples

### Emoji Indicators

| Emoji | Meaning | Example |
|-------|---------|---------|
| 🚀 | Workflow start | Workflow START/END |
| 🤖 | Agent operation | Agent START/END |
| 🧠 | LLM API call | Groq/Claude API call |
| 💾 | Database operation | Store/retrieve from Pinecone |
| ✅ | Success | Operation completed |
| ❌ | Error | Operation failed |
| ⚠️ | Warning | Potential issue |
| ℹ️ | Information | General info message |

### Sample Execution Log

```
================================================================================
Execution Started: 2024-01-18T15:30:45.123Z
Execution ID: 2024-01-18T15-30-45
================================================================================

[15:30:45.123] ℹ️  [ORCHESTRATOR] Creating 3 agents from configuration
[15:30:45.125] ✅ [AGENT_CREATION] Created agent 'root_agent' (Project Manager)
[15:30:45.126] ✅ [AGENT_CREATION] Created agent 'researcher' (Research Specialist)
[15:30:45.127] ✅ [AGENT_CREATION] Created agent 'writer' (Documentation Writer)
[15:30:45.128] ℹ️  [SUB_AGENT_LINKING] Linked 2 sub-agents to 'root_agent'
[15:30:45.129] 🚀 [WORKFLOW START] Type: sequential, Agents: 1
[15:30:45.130] ℹ️  [WORKFLOW] Starting SEQUENTIAL execution with 1 agents
[15:30:45.131] ℹ️  [SEQUENTIAL_EXECUTOR] Sequential execution: 1 agents
[15:30:45.132] 🤖 [AGENT START] Agent 'root_agent' (Project Manager) is executing...
[15:30:45.145] 💾 [DB RETRIEVE] Key 'root_agent_context' in 13ms
[15:30:45.147] 🧠 [LLM CALL] groq in 2001ms
[15:30:47.148] 💾 [DB STORE] Key 'root_agent' in 15ms
[15:30:47.150] ℹ️  [SUB_AGENT_DELEGATION] Delegating to 2 sub-agents
[15:30:47.151] 🤖 [AGENT START] Agent 'researcher' (Research Specialist) is executing...
[15:30:47.165] 💾 [DB RETRIEVE] Key 'researcher_context' in 14ms
[15:30:47.167] 🧠 [LLM CALL] groq in 2156ms
[15:30:49.323] 💾 [DB STORE] Key 'researcher' in 12ms
[15:30:49.325] ✅ [AGENT END] Agent 'researcher' completed in 2174ms
[15:30:49.326] 🤖 [AGENT START] Agent 'writer' (Documentation Writer) is executing...
[15:30:49.340] 💾 [DB RETRIEVE] Key 'writer_context' in 14ms
[15:30:49.342] 🧠 [LLM CALL] groq in 1987ms
[15:30:51.329] 💾 [DB STORE] Key 'writer' in 11ms
[15:30:51.331] ✅ [AGENT END] Agent 'writer' completed in 1991ms
[15:30:51.332] ✅ [AGENT END] Agent 'root_agent' completed in 6200ms
[15:30:51.333] ✅ [SEQUENTIAL_EXECUTOR] Sequential execution completed: 1 agents
[15:30:51.334] ✅ [WORKFLOW END] Completed in 6204ms

================================================================================
EXECUTION SUMMARY
================================================================================
Execution ID: 2024-01-18T15-30-45
Total Duration: 6204ms
Start Time: 2024-01-18T15:30:45.123Z
End Time: 2024-01-18T15:30:51.327Z
Total Events: 23
Agents Executed: 3
DB Operations: 8
LLM Calls: 3
Errors: 0
Log File: /logs/execution-2024-01-18T15-30-45.log
================================================================================
```

---

## How to Use Execution Logging

### Enable Logging (Default: On)

The logger is automatically enabled when you run the orchestrator:

```bash
npm start
```

All events are logged to:
1. **Console** (immediate feedback)
2. **File** (persistent record in `logs/` directory)

### Access Log Files

```bash
# View recent logs
ls -ltr logs/

# View latest log
tail logs/execution-*.log

# Search for errors in logs
grep "❌" logs/execution-*.log

# Get execution summary from log
grep "EXECUTION SUMMARY" -A 10 logs/execution-*.log
```

### Disable File Logging (Optional)

In `src/Orchestrator/Orchestrator.js`:

```javascript
// Change this line:
this.logger = new ExecutionLogger(true);  // Enable file logging

// To:
this.logger = new ExecutionLogger(false); // Disable file logging
```

---

## Log Analysis

### Extract Execution Timeline

The logger tracks a timeline of all events:

```javascript
// In your code, access timeline:
const timeline = logger.getTimeline();
console.log(JSON.stringify(timeline, null, 2));
```

Example output:
```json
[
  {
    "type": "agent_start",
    "time": 1705593045132,
    "timestamp": "2024-01-18T15:30:45.132Z",
    "agentId": "researcher",
    "role": "Research Specialist"
  },
  {
    "type": "llm_call",
    "time": 1705593047147,
    "timestamp": "2024-01-18T15:30:47.147Z",
    "model": "groq",
    "duration": 2001,
    "tokens": null
  }
]
```

### Get Execution Summary

```javascript
// Automatically printed at end, or access programmatically:
const summary = logger.getSummary();

// Returns:
{
  executionId: "2024-01-18T15-30-45",
  totalDuration: 6204,
  startTime: "2024-01-18T15:30:45.123Z",
  endTime: "2024-01-18T15:30:51.327Z",
  totalEvents: 23,
  agentsExecuted: 3,
  dbOperations: 8,
  llmCalls: 3,
  errors: 0,
  logFile: "/logs/execution-2024-01-18T15-30-45.log"
}
```

---

## Logger API Reference

### Core Methods

#### `info(message, section)`
Log informational message
```javascript
logger.info("Configuration validated", "CONFIG");
```

#### `success(message, section)`
Log successful operation
```javascript
logger.success("Agent created successfully", "AGENT_CREATION");
```

#### `error(message, error, section)`
Log error with optional stack trace
```javascript
try {
  // operation
} catch (err) {
  logger.error("Operation failed", err, "OPERATION");
}
```

#### `warn(message, section)`
Log warning
```javascript
logger.warn("Agent timeout approaching", "PERF");
```

#### `agentStart(agentId, role)`
Log when agent begins execution
```javascript
logger.agentStart("researcher", "Senior Researcher");
```

#### `agentEnd(agentId, duration, success)`
Log when agent completes
```javascript
logger.agentEnd("researcher", 2156, true);
```

#### `dbOperation(operation, key, duration)`
Log database operation
```javascript
logger.dbOperation("store", "researcher", 15);
logger.dbOperation("retrieve", "context", 13);
logger.dbOperation("query", "search_term", 45);
```

#### `llmCall(model, duration, tokens)`
Log LLM API call
```javascript
logger.llmCall("groq", 2001, null);
```

#### `workflowStart(workflowType, agentCount)`
Log workflow start
```javascript
logger.workflowStart("sequential", 3);
```

#### `workflowEnd(totalDuration, success)`
Log workflow completion
```javascript
logger.workflowEnd(6204, true);
```

#### `writeSummary()`
Write execution summary to console and file
```javascript
logger.writeSummary();
```

#### `getTimeline()`
Get array of all events
```javascript
const events = logger.getTimeline();
```

#### `getSummary()`
Get execution summary object
```javascript
const summary = logger.getSummary();
```

---

## Performance Metrics from Logs

### Extract Agent Execution Times

```bash
# Get agent execution durations
grep "AGENT END" logs/execution-*.log

# Output:
# [15:30:47.325] ✅ [AGENT END] Agent 'researcher' completed in 2174ms
# [15:30:51.331] ✅ [AGENT END] Agent 'writer' completed in 1991ms
# [15:30:51.332] ✅ [AGENT END] Agent 'root_agent' completed in 6200ms
```

### Extract LLM Call Times

```bash
grep "LLM CALL" logs/execution-*.log

# Output:
# [15:30:47.147] 🧠 [LLM CALL] groq in 2001ms
# [15:30:49.342] 🧠 [LLM CALL] groq in 1987ms
```

### Extract Database Operation Times

```bash
grep "DB_" logs/execution-*.log | grep "💾"

# Output:
# [15:30:45.145] 💾 [DB RETRIEVE] Key 'context' in 13ms
# [15:30:47.148] 💾 [DB STORE] Key 'researcher' in 15ms
```

---

## Troubleshooting with Logs

### Issue: Slow Agent Execution

Look at agent end times:
```bash
grep "AGENT END" logs/execution-*.log | grep -E "completed in [0-9]{5,}"
```

Agents taking >5000ms should be investigated.

### Issue: Database Slowness

Check DB operation times:
```bash
grep "DB_" logs/execution-*.log | awk '{print $NF}'
```

Operations >100ms warrant investigation.

### Issue: LLM API Delays

Check LLM call times:
```bash
grep "LLM CALL" logs/execution-*.log | awk '{print $(NF-1)}'
```

Calls >3000ms may indicate API issues or rate limiting.

### Issue: Workflow Failures

Search for errors:
```bash
grep "❌" logs/execution-*.log
grep "ERROR" logs/execution-*.log
```

Look for stack traces to identify root cause.

---

## Best Practices

### 1. **Regular Log Review**
Check logs daily for patterns and trends

### 2. **Archive Old Logs**
```bash
# Move old logs to archive
mv logs/execution-2024-01-01*.log archive/
```

### 3. **Monitor Agent Durations**
- Fast: <500ms
- Normal: 500ms - 3000ms
- Slow: 3000ms - 10000ms
- Very Slow: >10000ms (investigate)

### 4. **Database Operations**
- Fast: <50ms
- Normal: 50ms - 200ms
- Slow: 200ms - 500ms (investigate)

### 5. **LLM Calls**
- Fast: <2000ms
- Normal: 2000ms - 5000ms
- Slow: 5000ms - 10000ms
- Very Slow: >10000ms (API issue)

---

## Integration with Monitoring

### Export Logs to External System

```javascript
// In Orchestrator
const fs = require("fs");

// After execution
const summary = this.logger.getSummary();

// Send to monitoring service
fetch("https://monitoring.example.com/api/executions", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(summary)
});
```

### Create Alerts from Logs

```bash
# Alert if any agent takes >5 seconds
grep "AGENT END.*[0-9]\{5,\}ms" logs/execution-*.log && \
  send_alert "Agent execution timeout detected"

# Alert if any LLM call fails
grep "❌.*LLM" logs/execution-*.log && \
  send_alert "LLM API call failed"
```

---

## Summary

**Execution Logging** provides:
- ✅ Real-time console feedback
- ✅ Persistent file records
- ✅ Performance metrics
- ✅ Error tracking
- ✅ Complete execution timeline
- ✅ Debugging capabilities
- ✅ Production monitoring

**Key Methods:**
- Agent tracking: `agentStart()`, `agentEnd()`
- Performance: `dbOperation()`, `llmCall()`
- Status: `success()`, `error()`, `warn()`
- Summary: `writeSummary()`, `getSummary()`

Start using execution logs today to understand and optimize your multi-agent orchestrator! 📊
