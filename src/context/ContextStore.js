const path = require('path')

const PersistentMemory = require(path.join(__dirname,'PersistentMemory'));

class ContextStore {
  constructor() {
    this.memory = new PersistentMemory();
  }

  async get(key) {
    return await this.memory.get(key);
  }

  async set(key, value) {
    await this.memory.set(key, value);
  }

  async getAll() {
    return await this.memory.getAll();
  }

  async flush() {
    await this.memory.close();
  }
}

module.exports = ContextStore;
