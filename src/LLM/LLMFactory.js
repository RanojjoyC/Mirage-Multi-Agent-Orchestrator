const GroqLLM = require("./GroqLLM");
const ClaudeLLM = require("./ClaudeLLM");
const MockLLM = require("./MockLLM");

class LLMFactory {
  static create(provider = "groq", options = {}) {
    switch (provider.toLowerCase()) {
      case "groq":
        return new GroqLLM(options);
      case "claude":
      case "anthropic":
        return new ClaudeLLM(options);
      case "mock":
        return new MockLLM();
      default:
        console.warn(`Unknown LLM provider: ${provider}, defaulting to MockLLM`);
        return new MockLLM();
    }
  }
}

module.exports = LLMFactory;
