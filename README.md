# Mirage - Multi-Agent Orchestrator

**Declarative Multi-Agent Orchestration Using YAML**

Build complex AI agent workflows in minutes, not days. Mirage eliminates the complexity of multi-agent coordination by replacing hundreds of lines of procedural code with simple, declarative YAML configuration.

```yaml
# This is all you need!
agents:
  - id: analyst
    role: Data Analyst
    goal: Analyze CSV data and summarize trends
    tools: [fileread, python, calculator]

workflow:
  type: sequential
  steps:
    - agent: analyst
```

## ✨ Key Features

- 🎯 **Zero-Code Orchestration** - Define complete workflows in YAML
- 🔧 **Automatic Tool Integration** - Agents autonomously discover and invoke tools
- ⚡ **True Parallel Execution** - Run agents concurrently with automatic result aggregation
- 💾 **Persistent Memory** - Vector database (Pinecone) for cross-session agent memory
- 📊 **Production-Ready Logging** - Millisecond-precision execution timeline
- 🌳 **Hierarchical Delegation** - Agents can have sub-agents for complex task decomposition
- 🔒 **Security-First Design** - Input validation, timeouts, and dangerous command blocking
- 🤖 **Multi-LLM Support** - Groq, Claude, or Mock LLMs out of the box

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn
- Pinecone account (free tier available)
- Groq API key (free tier available)

### Installation

```bash
# Clone the repository
git clone https://github.com/RanojjoyC/Mirage-Multi-Agent-Orchestrator.git
cd Mirage-Multi-Agent-Orchestrator

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your API keys:
# GROQ_API_KEY=your_groq_api_key
# PINECONE_API_KEY=your_pinecone_api_key
# PINECONE_INDEX_NAME=mirage-memory

# Create Pinecone index
node create-index.js

# Run your first workflow
npm start
```

### Your First Workflow

Create a YAML file in the `config/` directory:

```yaml
# config/my-first-workflow.yaml
agents:
  - id: greeter
    role: Friendly Assistant
    goal: Greet the user
    instruction: Say hello and introduce yourself

  - id: helper
    role: Helpful Assistant
    goal: Offer assistance
    instruction: Ask what you can help with today

workflow:
  type: sequential
  steps:
    - agent: greeter
    - agent: helper
```

Run it:

```bash
npm start my-first-workflow.yaml
```
## 🎓 Core Concepts

### Agents

Agents are AI-powered entities with:
- **ID**: Unique identifier
- **Role**: What the agent is (e.g., "Data Analyst")
- **Goal**: What the agent aims to achieve
- **Instruction**: Specific guidance for the agent
- **Tools**: Available tools (calculator, webfetch, fileread, python, bash)
- **Sub-Agents**: Optional child agents for delegation

### Context Store

Automatic context sharing between agents:
- Each agent stores its output in the context
- Subsequent agents automatically receive all previous outputs
- Backed by Pinecone vector database for persistence
- Enables semantic search across agent memories

### Workflows

Two execution modes:
- **Sequential**: Agents execute one after another, building on previous work
- **Parallel**: Agents execute simultaneously, with optional finalizer

## 🔄 Workflow Types

### Sequential Execution

Perfect for pipelines where each step builds on the previous:

```yaml
workflow:
  type: sequential
  steps:
    - agent: researcher    # Gathers information
    - agent: analyst       # Analyzes the data
    - agent: writer        # Creates report
```

**Use Cases**: Data pipelines, content creation, multi-step analysis

### Parallel Execution

Ideal for independent tasks that can run concurrently:

```yaml
workflow:
  type: parallel
  branches:
    - tech_researcher    # Runs simultaneously
    - market_researcher  # Runs simultaneously
    - competitor_researcher  # Runs simultaneously
  then:
    agent: synthesizer   # Combines all results
```

**Use Cases**: Multi-source research, parallel data processing, A/B testing

## 🛠️ Available Tools

### Calculator
Perform mathematical calculations:
```yaml
tools: [calculator]
# Agent can use: [TOOL: calculator | {"expression": "2 + 2 * 3"}]
```

### WebFetch
Retrieve content from URLs:
```yaml
tools: [webfetch]
# Agent can use: [TOOL: webfetch | {"url": "https://example.com"}]
```

### FileRead
Read local files:
```yaml
tools: [fileread]
# Agent can use: [TOOL: fileread | {"path": "data.csv"}]
```

### Python
Execute Python code:
```yaml
tools: [python]
# Agent can use: [TOOL: python | {"code": "print(2+2)"}]
```

### Bash
Run shell commands (with safety restrictions):
```yaml
tools: [bash]
# Agent can use: [TOOL: bash | {"command": "ls -la"}]
```

## ⚙️ Configuration Reference

### Complete Agent Configuration

```yaml
agents:
  - id: agent_id              # Required: Unique identifier
    role: Agent Role          # Required: Agent's role
    goal: Agent Goal          # Required: What agent aims to achieve
    instruction: "Detailed instructions"  # Optional: Specific guidance
    tools:                    # Optional: Available tools
      - calculator
      - python
      - fileread
    sub_agents:               # Optional: Child agents
      - sub_agent_1
      - sub_agent_2
```

### Sequential Workflow

```yaml
workflow:
  type: sequential
  steps:
    - agent: agent_id_1
    - agent: agent_id_2
    - agent: agent_id_3
```

### Parallel Workflow

```yaml
workflow:
  type: parallel
  branches:
    - agent_id_1
    - agent_id_2
    - agent_id_3
  then:                      # Optional: Finalizer agent
    agent: synthesizer
```

## 🌟 Advanced Features

### Hierarchical Agent Delegation

Create agent hierarchies for complex task decomposition:

```yaml
agents:
  - id: project_manager
    role: Project Coordinator
    goal: Coordinate the entire project
    sub_agents:
      - data_specialist
      - visualization_expert
      - report_writer

  - id: data_specialist
    role: Data Analyst
    tools: [python, fileread]
    sub_agents:
      - statistics_agent
      - ml_agent

  - id: statistics_agent
    role: Statistical Analyst
    tools: [calculator, python]

  - id: ml_agent
    role: Machine Learning Expert
    tools: [python]

  - id: visualization_expert
    role: Data Visualizer
    tools: [python]

  - id: report_writer
    role: Report Writer
    goal: Create comprehensive reports

workflow:
  type: sequential
  steps:
    - agent: project_manager
```

### Multi-LLM Support

Switch between LLM providers easily:

```javascript
// In src/agents/Agentfactory.js
// Change from:
const llm = new GroqLLM();

// To:
const llm = new ClaudeLLM();

// Or for testing:
const llm = new MockLLM();
```

## 📝 Examples

### Example 1: Data Analysis Pipeline

```yaml
# config/data-analysis.yaml
agents:
  - id: data_loader
    role: Data Loader
    goal: Load CSV data
    instruction: Use fileread tool to load sample_data.csv
    tools:
      - fileread

  - id: data_analyzer
    role: Data Analyst
    goal: Analyze data and compute statistics
    instruction: Use Python to calculate mean, median, trends
    tools:
      - python
      - calculator

  - id: report_generator
    role: Report Writer
    goal: Create analysis report
    instruction: Summarize findings in a clear report

workflow:
  type: sequential
  steps:
    - agent: data_loader
    - agent: data_analyzer
    - agent: report_generator
```

### Example 2: Parallel Research

```yaml
# config/research.yaml
agents:
  - id: tech_researcher
    role: Technology Researcher
    goal: Research AI frameworks
    tools:
      - webfetch

  - id: market_researcher
    role: Market Researcher
    goal: Research market trends
    tools:
      - webfetch

  - id: academic_researcher
    role: Academic Researcher
    goal: Find academic papers
    tools:
      - webfetch

  - id: synthesizer
    role: Research Synthesizer
    goal: Combine all research findings
    instruction: Create comprehensive analysis from all sources

workflow:
  type: parallel
  branches:
    - tech_researcher
    - market_researcher
    - academic_researcher
  then:
    agent: synthesizer
```

### Example 3: Content Creation Workflow

```yaml
# config/content-creation.yaml
agents:
  - id: researcher
    role: Content Researcher
    goal: Gather information on the topic
    tools:
      - webfetch

  - id: outline_creator
    role: Content Strategist
    goal: Create article outline

  - id: writer
    role: Content Writer
    goal: Write engaging content

  - id: editor
    role: Editor
    goal: Improve quality and clarity

  - id: seo_optimizer
    role: SEO Specialist
    goal: Optimize for search engines

workflow:
  type: sequential
  steps:
    - agent: researcher
    - agent: outline_creator
    - agent: writer
    - agent: editor
    - agent: seo_optimizer
```

## 📊 Logging & Monitoring

Mirage provides comprehensive execution logging:

### Console Output

```
🚀 Starting Multi-Agent Orchestrator...
✅ Pinecone connected
ℹ️  [ORCHESTRATOR] Creating 3 agents from configuration
✅ [AGENT_CREATION] Created agent 'analyst' (Data Analyst)
🤖 [AGENT START] Agent 'analyst' (Data Analyst) is executing...
💾 [DB RETRIEVE] analyst_context in 150ms
🧠 [LLM CALL] llama-3.1-8b-instant in 1250ms
🔧 [TOOL] Executing: python
💾 [DB STORE] analyst in 50ms
✅ [AGENT END] Agent 'analyst' completed in 1450ms
```

### Log Files

Detailed logs saved to `logs/execution-[timestamp].log`:

```
[12:30:45.123] 🚀 [WORKFLOW START] Type: sequential, Agents: 3
[12:30:46.234] 🤖 [AGENT START] Agent 'analyst' executing...
[12:30:46.634] 🧠 [LLM CALL] llama-3.1-8b-instant in 1250ms
[12:30:46.684] ✅ [AGENT END] Agent 'analyst' completed in 1450ms
```

### Execution Summary

```
════════════════════════════════════════
EXECUTION SUMMARY
════════════════════════════════════════
Execution ID: 2025-01-18T12-30-45
Total Duration: 5243ms
Start Time: 2025-01-18T12:30:45.123Z
End Time: 2025-01-18T12:30:50.366Z
Total Events: 47
Agents Executed: 3
DB Operations: 12
LLM Calls: 5
Errors: 0
Log File: logs/execution-2025-01-18T12-30-45.log
════════════════════════════════════════
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│          YAML Configuration             │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│    Parser & Validator                   │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│         Orchestrator                    │
│  ┌─────────────┐  ┌─────────────┐      │
│  │ Sequential  │  │  Parallel   │      │
│  │  Executor   │  │  Executor   │      │
│  └─────────────┘  └─────────────┘      │
└──────────────┬──────────────────────────┘
               ↓
     ┌─────────────────┐
     │  Agent Factory  │
     └────────┬────────┘
              ↓
   ┌──────────────────────┐
   │   Agent Instances    │
   └──┬────────┬────────┬─┘
      │        │        │
      ↓        ↓        ↓
   ┌────┐  ┌────┐  ┌─────────┐
   │LLM │  │Tool│  │ Context │
   │    │  │Mgr │  │  Store  │
   └────┘  └────┘  └────┬────┘
                        ↓
                 ┌──────────────┐
                 │   Pinecone   │
                 │  Vector DB   │
                 └──────────────┘
```

## 🔐 Security

Mirage implements multiple security layers:

- ✅ **Input Validation**: All tool inputs are validated
- ✅ **Path Traversal Prevention**: File operations blocked from accessing parent directories
- ✅ **Dangerous Command Blocking**: Commands like `rm`, `dd`, `format` are blocked
- ✅ **Execution Timeouts**: All tools have 30-second maximum execution time
- ✅ **Resource Limits**: Output size limits prevent memory exhaustion
- ✅ **Expression Sanitization**: Calculator only accepts safe mathematical expressions

## 🚀 Performance

### Benchmarks

| Operation | Latency |
|-----------|---------|
| Agent Creation | ~10ms per agent |
| LLM Call (Groq) | 500-1000ms |
| LLM Call (Claude) | 1000-2000ms |
| Pinecone Query | 50-200ms |
| Tool: Calculator | ~1ms |
| Tool: FileRead | 10-50ms |
| Tool: Python | 100-1000ms |
| Tool: WebFetch | 200-2000ms |

### Scalability

- **Agents**: Unlimited (memory-constrained)
- **Parallel Execution**: Limited by system resources
- **Context Size**: 10MB per key (Pinecone limit)
- **Typical Throughput**: 5-10 agents per minute

## 🙏 Acknowledgments

- [Groq](https://groq.com/) for fast LLM inference
- [Anthropic](https://anthropic.com/) for Claude API
- [Pinecone](https://pinecone.io/) for vector database
- The open-source community for inspiration

Project Link: [https://github.com/RanojjoyC/Mirage-Multi-Agent-Orchestrator](https://github.com/RanojjoyC/Mirage-Multi-Agent-Orchestrator)




