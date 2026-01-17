# 🎯 Execution Logging - Quick Reference

## What Gets Logged?

### Automatically Tracked
✅ Workflow start/end with duration  
✅ Agent start/end with execution time  
✅ Database operations (store, retrieve, query) with duration  
✅ LLM API calls with duration  
✅ Sub-agent delegation  
✅ Errors with stack traces  
✅ All timestamps  

### Output Locations
📁 **Console** - Real-time status (with emojis)  
📄 **File** - `logs/execution-YYYY-MM-DDTHH-MM-SS.log`

---

## Quick Start

### 1. Run Your Workflow
```bash
npm start
```

### 2. Check Console Output
```
[12:34:56.789] 🚀 [WORKFLOW START] Type: sequential, Agents: 2
[12:34:56.890] 🤖 [AGENT START] Agent 'researcher' is executing...
[12:34:58.234] 🧠 [LLM CALL] groq in 1344ms
[12:34:58.245] 💾 [DB STORE] Key 'researcher' in 11ms
[12:34:58.250] ✅ [AGENT END] Agent 'researcher' completed in 1360ms
```

### 3. View Log Files
```bash
# List all logs
ls logs/

# View latest log
cat logs/execution-*.log | tail -50

# Search for errors
grep "❌" logs/execution-*.log
```

### 4. Check Summary
At end of execution, you'll see:
```
================================================================================
EXECUTION SUMMARY
================================================================================
Execution ID: 2024-01-18T15-30-45
Total Duration: 6204ms
Agents Executed: 3
DB Operations: 8
LLM Calls: 3
Errors: 0
Log File: /logs/execution-2024-01-18T15-30-45.log
================================================================================
```

---

## Log Levels (by emoji)

| Emoji | Level | Color | When Used |
|-------|-------|-------|-----------|
| 🚀 | WORKFLOW | Blue | Workflow start/end |
| 🤖 | AGENT | Cyan | Agent execution |
| 🧠 | LLM | Purple | LLM API calls |
| 💾 | DATABASE | Yellow | DB operations |
| ✅ | SUCCESS | Green | Success status |
| ❌ | ERROR | Red | Errors/failures |
| ⚠️ | WARN | Orange | Warnings |
| ℹ️ | INFO | Gray | Information |

---

## Common Log Analysis

### Find Slow Agents
```bash
grep "AGENT END" logs/execution-*.log | grep -E "[0-9]{4,}ms"
# Shows agents taking >1000ms
```

### Find Failed Operations
```bash
grep "❌" logs/execution-*.log
# Lists all errors
```

### Get Total Execution Time
```bash
grep "WORKFLOW END" logs/execution-*.log | tail -1
# Shows completion time of last run
```

### Count LLM Calls
```bash
grep -c "LLM CALL" logs/execution-*.log
```

### Find Database Slowdowns
```bash
grep "DB_" logs/execution-*.log | awk '{print $NF}' | sort -n | tail -5
# Shows 5 slowest DB operations
```

---

## Performance Benchmarks

### Healthy Ranges
```
Agent Execution:    500ms - 3000ms (per agent)
LLM API Call:       1500ms - 5000ms
Database Operation: 10ms - 100ms
Total Workflow:     <30 seconds (for 3 agents)
```

### Performance Issues
```
Agent >10 seconds     → Investigate LLM
LLM Call >10 seconds  → API timeout/rate limit
DB Op >500ms          → Vector DB issue
Workflow >60 seconds  → Overall optimization needed
```

---

## Logger API Cheatsheet

```javascript
// Logging methods available
logger.info(msg, section)           // ℹ️ Information
logger.success(msg, section)        // ✅ Success
logger.error(msg, error, section)   // ❌ Error
logger.warn(msg, section)           // ⚠️ Warning
logger.agentStart(id, role)         // 🤖 Agent started
logger.agentEnd(id, duration)       // 🤖 Agent ended
logger.dbOperation(op, key, dur)    // 💾 DB operation
logger.llmCall(model, duration)     // 🧠 LLM call
logger.workflowStart(type, count)   // 🚀 Workflow start
logger.workflowEnd(duration, ok)    // 🚀 Workflow end
logger.writeSummary()               // 📊 Print summary
logger.getSummary()                 // Get summary object
logger.getTimeline()                // Get event timeline
```

---

## File Organization

```
logs/
├── execution-2024-01-18T15-30-45.log  ← Latest first run
├── execution-2024-01-18T15-35-20.log  ← Later run
├── execution-2024-01-18T15-40-15.log  ← Most recent
```

Each file contains:
- Start/end timestamps
- All events with times
- Performance metrics
- Error details
- Execution summary

---

## Typical Execution Log Flow

```
1️⃣ Orchestrator creates agents
   ├─ Create agent 'researcher'
   ├─ Create agent 'writer'
   └─ Link sub-agents (if any)

2️⃣ Workflow starts
   └─ Type: sequential/parallel

3️⃣ For each agent:
   ├─ 🤖 Agent START
   ├─ 💾 Retrieve context from DB
   ├─ 🧠 Call LLM API
   ├─ 💾 Store result in DB
   ├─ (Optional) Run sub-agents
   └─ ✅ Agent END

4️⃣ Workflow completes
   └─ Print execution summary
```

---

## Troubleshooting with Logs

### Problem: Slow Execution
```bash
# Check agent times
grep "AGENT END" logs/execution-*.log

# Check LLM times
grep "LLM CALL" logs/execution-*.log

# Compare to benchmarks
```

### Problem: Agent Failed
```bash
# Find the error
grep "❌.*AGENT_ERROR" logs/execution-*.log

# See full details
grep -A 5 "Agent.*failed" logs/execution-*.log
```

### Problem: Database Issues
```bash
# Check DB operation times
grep "DB_" logs/execution-*.log | tail -10

# Look for errors
grep "DB_" logs/execution-*.log | grep "❌"
```

---

## Log Retention

### Automatic Cleanup (Optional)
```bash
# Keep last 30 days of logs
find logs/ -name "execution-*.log" -mtime +30 -delete
```

### Manual Cleanup
```bash
# Archive old logs
mkdir archive
mv logs/execution-2024-01-01*.log archive/

# Remove very old logs
rm archive/execution-2024-01-*.log
```

---

## Integration Points

### Export to Monitoring
- Check `getSummary()` after execution
- Send to monitoring dashboard
- Track trends over time

### Alert on Failures
- Grep for "❌" in logs
- Trigger alerts automatically
- Page on-call team if needed

### Performance Tracking
- Analyze LLM call durations
- Track agent performance trends
- Optimize slow components

---

## Key Metrics from Logs

**Extract with:**
```bash
# Execution time
grep "WORKFLOW END" logs/execution-*.log | tail -1

# Number of agents
grep "WORKFLOW START" logs/execution-*.log | tail -1

# Total LLM calls
grep "LLM CALL" logs/execution-*.log | wc -l

# Total DB ops
grep "DB_" logs/execution-*.log | wc -l

# Error count
grep "❌" logs/execution-*.log | wc -l
```

---

## Remember

✨ **Every execution is automatically logged!**

- ✅ Console shows real-time status
- ✅ Files preserve history
- ✅ Summaries at end of run
- ✅ Performance metrics tracked
- ✅ Errors with stack traces
- ✅ Complete timeline available

**Start analyzing your logs today!** 📊🚀
