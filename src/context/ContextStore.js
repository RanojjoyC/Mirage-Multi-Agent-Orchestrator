class ContextStore {
  constructor() {
    this.data = {};
  }
  set(agentId, output) {
    this.data[agentId] = output;
  }
  getAll() {
    return { ...this.data };
  }
}
module.exports = ContextStore;
