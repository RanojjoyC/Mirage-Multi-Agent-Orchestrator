function validateConfig(config){
    if(!config.agents || !config.workflow)
        throw new Error("Invalid config: agents ot workflow missing")
      validateAgents(config.agents)
      validateWorkflow(config.workflow,config.agents)
}

function validateAgents(agents){ 
    if(!Array.isArray(agents))
        throw new Error("agents must be an array")
    const ids=new Set();
    for(const agent of agents){
        if(typeof agent !== 'object')
            throw new Error("Each agent must be an object")
        if(!agent.id)
            throw new Error("Agent id not present")
        if(ids.has(agent.id))
            throw new Error(`${agent.id} is already present as id of another agent`)
        if(!agent.role)
            throw new Error(`Role of agent ${agent.id} not present`)
        if(typeof agent.role !== 'string')
            throw new Error(`Role of agent ${agent.id} is not a string`)
        if(!agent.goal)
            throw new Error(`Goal of agent ${agent.id} is not present`)
        if(typeof agent.goal !== 'string')
            throw new Error(`Goal of agent ${agent.id} is not a string`)
        if(agent.tools)
            if(!Array.isArray(agent.tools))
                throw new Error(`Tools of an agent must be represented in the form of an array. id: ${agent.id}`)
    }
}

function validateWorkflow(workflow,agents){
    if(typeof workflow !== 'object')
        throw new Error("workflow of each agent much be represented as an object")
    if(!workflow.type)
        throw new Error("workflow type not present")
    if(typeof workflow.type !== 'string')
        throw new Error("type of workflow must be a string")

    const agentIds=new Set(agents.map(a=>a.id));

    if(workflow.type === 'sequential')
        validateSequential(workflow,agentIds)
    else if(workflow.type === 'parallel')
        validateParallel(workflow,agentIds)
    else
        throw new Error(`Unsupported workflow type: ${workflow.type}`)
}

function validateSequential(workflow,agentIds){
    if(!workflow.steps)
        throw new Error("Steps of sequential workflow not present")
    if(!Array.isArray(workflow.steps))
        throw new Error("Steps of sequential workflow must be an array")
    for (const step of workflow.steps) {
    if (!step.agent || typeof step.agent !== 'string') {
      throw new Error('Each step must specify an agent')
    }

    if (!agentIds.has(step.agent)) {
      throw new Error(`Unknown agent in steps: ${step.agent}`)
    }
  }
}

function validateParallel(workflow,agentIds){
    if(!workflow.branches)
        throw new Error("Branches of parallel workflow not present")
    if(!Array.isArray(workflow.branches))
        throw new Error("Branches of parallel workflow must be an array")
    for (const id of workflow.branches) {
    if (!agentIds.has(id)) {
      throw new Error(`Unknown agent in branches: ${id}`)
    }
  }

  if (workflow.then) {
    if (!workflow.then.agent || !agentIds.has(workflow.then.agent)) {
      throw new Error(`Unknown agent in then: ${workflow.then.agent}`)
    }
  }
}

module.exports = {validateConfig};