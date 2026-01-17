class LLMClient {
  async generate() {
    throw new Error("generate() must be implemented");
  }
}
module.exports = LLMClient;
